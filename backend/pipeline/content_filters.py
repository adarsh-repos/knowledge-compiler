"""
Shared rules for skipping noise and merging fragmented sidebar content.
"""

from __future__ import annotations

import re

from backend.pipeline.models import ClassifiedBlock, Coordinates, LayoutBlock

_GLOSSARY_HEADING_RE = re.compile(r"^(New words|Glossary)\s*$", re.I)
_GLOSSARY_LINE_RE = re.compile(r"^[A-Za-z][\w\s'’-]{0,50}\s+[–\-:]\s+.+$")
_ACTIVITY_LABEL_RE = re.compile(r"^(Activity|Discuss|Imagine|Let'?s\s+\w+)\s*$", re.I)
_ACTIVITY_PROMPT_RE = re.compile(r"^(Activity|Discuss|Imagine|Let'?s)\b", re.I)
_PAGE_MARKER_RE = re.compile(r"^\d{1,3}$")

_MAX_ACTIVITY_GAP = 28.0
_MAX_GLOSSARY_GAP = 35.0
_FOOTER_Y_MIN = 735.0
_RIGHT_SIDEBAR_X_MIN = 340.0


def is_glossary_text(text: str, content_type: str | None = None) -> bool:
    t = (text or "").strip()
    if not t:
        return False
    if content_type == "glossary":
        return True
    if _GLOSSARY_HEADING_RE.match(t):
        return True
    if _GLOSSARY_LINE_RE.match(t):
        return True
    return False


def is_activity_label(text: str) -> bool:
    return bool(_ACTIVITY_LABEL_RE.match((text or "").strip()))


def is_page_marker_text(text: str, coordinates: Coordinates | None = None) -> bool:
    t = (text or "").strip()
    if not t or not _PAGE_MARKER_RE.match(t):
        return False
    if coordinates is None:
        return True
    return coordinates.y0 >= _FOOTER_Y_MIN


def is_page_marker_layout(layout: LayoutBlock) -> bool:
    return is_page_marker_text(layout.text or "", layout.coordinates)


def is_glossary_box_color(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb
    # Yellow/beige NCERT glossary boxes — r and g stay close (e.g. #e3dfb6).
    if r > 200 and g > 200 and b < 200 and abs(r - g) < 22:
        return True
    if r > 200 and g > 175 and b > 165 and abs(r - g) < 18:
        return True
    return False


def is_activity_box_color(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb
    # Salmon/pink activity boxes — noticeably redder than glossary (e.g. #d99f9a, #e8c4bd).
    if r > 195 and g > 140 and b > 130 and (r - g) > 22 and r > g > b:
        return True
    return False


def _vertical_gap(prev: Coordinates, curr: Coordinates) -> float:
    return curr.y0 - prev.y1


def _same_sidebar_column(prev: Coordinates, curr: Coordinates) -> bool:
    return abs(prev.x0 - curr.x0) < 30 and prev.x0 >= _RIGHT_SIDEBAR_X_MIN


def can_merge_activity_fragments(prev: ClassifiedBlock, curr: ClassifiedBlock) -> bool:
    if prev.role != "activity" or curr.role != "activity":
        return False
    if prev.page != curr.page:
        return False
    if not prev.coordinates or not curr.coordinates:
        return False
    if not _same_sidebar_column(prev.coordinates, curr.coordinates):
        return False
    if _vertical_gap(prev.coordinates, curr.coordinates) > _MAX_ACTIVITY_GAP:
        return False
    return True


def can_merge_glossary_fragments(prev: ClassifiedBlock, curr: ClassifiedBlock) -> bool:
    if prev.role != "glossary" or curr.role != "glossary":
        return False
    if prev.page != curr.page:
        return False
    if not prev.coordinates or not curr.coordinates:
        return False
    if not _same_sidebar_column(prev.coordinates, curr.coordinates):
        return False
    if _vertical_gap(prev.coordinates, curr.coordinates) > _MAX_GLOSSARY_GAP:
        return False
    return True


def _join_fragment_text(parts: list[str], role: str = "") -> str:
    cleaned = [p.strip() for p in parts if p and p.strip()]
    if not cleaned:
        return ""
    if len(cleaned) == 1:
        return cleaned[0]
    if role == "glossary" or any(is_glossary_text(p) for p in cleaned[:1]):
        return "\n".join(cleaned)
    if is_activity_label(cleaned[0]) and len(cleaned) > 1:
        return cleaned[0] + "\n" + " ".join(cleaned[1:])
    return " ".join(cleaned)


def consolidate_role_fragments(
    blocks: list[ClassifiedBlock],
    role: str,
    can_merge,
) -> list[ClassifiedBlock]:
    if not blocks:
        return blocks

    merged: list[ClassifiedBlock] = []
    i = 0
    while i < len(blocks):
        block = blocks[i]
        if block.role != role:
            merged.append(block)
            i += 1
            continue

        group = [block]
        j = i + 1
        while j < len(blocks) and can_merge(group[-1], blocks[j]):
            group.append(blocks[j])
            j += 1

        combined_text = _join_fragment_text([(b.text or "") for b in group], role=role)
        primary = group[0].model_copy(update={"text": combined_text})
        merged.append(primary)
        for fragment in group[1:]:
            merged.append(fragment.model_copy(update={"role": "fragment"}))
        i = j

    return merged


def attach_orphan_activity_labels(blocks: list[ClassifiedBlock]) -> list[ClassifiedBlock]:
    """Merge a standalone 'Activity' label with the next activity body on the same page."""
    out = list(blocks)
    i = 0
    while i < len(out):
        block = out[i]
        text = (block.text or "").strip()
        if block.role != "activity" or not is_activity_label(text) or "\n" in text:
            i += 1
            continue

        body_idx: int | None = None
        for j in range(i + 1, len(out)):
            nxt = out[j]
            if nxt.page != block.page:
                break
            if nxt.role in ("sidebar", "fragment"):
                continue
            if nxt.role == "activity":
                body_idx = j
                break
            break

        if body_idx is not None:
            body_block = out[body_idx]
            combined = text + "\n" + (body_block.text or "").strip()
            out[i] = block.model_copy(update={"text": combined})
            out[body_idx] = body_block.model_copy(update={"role": "fragment"})
        i += 1
    return out


def parse_activity_content(text: str) -> tuple[str, str, str]:
    """Return (title, body, activity_type)."""
    raw = (text or "").strip()
    if not raw:
        return "Activity", "", "activity"

    lines = [ln.strip() for ln in raw.split("\n") if ln.strip()]
    if not lines:
        return "Activity", "", "activity"

    first = lines[0]
    if is_activity_label(first):
        activity_type = first.lower().split()[0].replace("'", "")
        body = " ".join(lines[1:]).strip()
        return first, body, activity_type

    if _ACTIVITY_PROMPT_RE.match(first):
        activity_type = first.split()[0].lower().replace("'", "")
        return "Activity", raw, activity_type

    return "Activity", raw, "activity"
