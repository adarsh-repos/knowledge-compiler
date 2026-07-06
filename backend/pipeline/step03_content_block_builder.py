"""
STEP 3 — Content Block Builder
==============================
Classify Step 2 layout blocks into semantic ContentBlocks (no AI).

Types: paragraph, heading, image, caption, table, activity, exercise,
       glossary, sidebar, timeline, quote
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from backend.pipeline.models import (
    ContentBlock,
    Coordinates,
    LayoutBlock,
    PageLayout,
    Step02LayoutResult,
    Step03ContentBlockResult,
    Step03Validation,
)

from backend.pipeline.map_detection import (
    is_caption_text,
    large_image_regions,
    should_skip_map_label,
)
from backend.pipeline.content_filters import is_page_marker_layout

_SKIP_LAYOUT = frozenset({"line", "shape"})

_HEADING_RE = [
    re.compile(r"^\d+\s{1,2}[A-Z\u2018\u2019]"),
    re.compile(r"^\d+\.\d+\s+"),
    re.compile(r"^Contents$", re.I),
    re.compile(r"^Section\s+", re.I),
]
_ACTIVITY_RE = [
    re.compile(r"^Activity\s*$", re.I),
    re.compile(r"^Discuss\s*$", re.I),
    re.compile(r"^Imagine\b", re.I),
    re.compile(r"^Let's\s+(discuss|revise|recall)", re.I),
]
_EXERCISE_RE = [
    re.compile(r"^EXERCISES?\b", re.I),
    re.compile(r"^Questions?\s*$", re.I),
    re.compile(r"^Write\s+(a\s+)?(note|short)", re.I),
    re.compile(r"^(Answer|Do\s+you\s+think)\b", re.I),
]
_GLOSSARY_RE = [
    re.compile(r"^New words\s*$", re.I),
    re.compile(r"^Glossary\s*$", re.I),
    re.compile(r"^[A-Za-z][\w\s-]{1,40}\s+[–-]\s+"),
]
_SIDEBAR_RE = [
    re.compile(r"^Source\s*$", re.I),
    re.compile(r"^Source\s+[A-Z]\s*$", re.I),
]
_TIMELINE_RE = [
    re.compile(r"^Some important dates\s*$", re.I),
    re.compile(r"^\d{4}(-\d{4})?\s*$"),
]
_QUOTE_RE = re.compile(r'^["\u201c\u2018\u2019]')

_TOPIC_PREFIXES = ("The ", "Nationalism and", "Visualising ", "Contents")


def _overlap_ratio(inner: Coordinates, outer: Coordinates) -> float:
    x0 = max(inner.x0, outer.x0)
    y0 = max(inner.y0, outer.y0)
    x1 = min(inner.x1, outer.x1)
    y1 = min(inner.y1, outer.y1)
    if x1 <= x0 or y1 <= y0:
        return 0.0
    inter = (x1 - x0) * (y1 - y0)
    inner_area = max((inner.x1 - inner.x0) * (inner.y1 - inner.y0), 1.0)
    return inter / inner_area


def _in_sidebar_region(coords: Coordinates) -> bool:
    """NCERT sidebars are typically in the left margin."""
    return coords.x0 < 55 and coords.x1 < 120


def _classify_text(
    text: str,
    block: LayoutBlock,
    in_colored_box: bool,
) -> str:
    t = text.strip()
    if not t:
        return "paragraph"

    for pat in _ACTIVITY_RE:
        if pat.search(t):
            return "activity"
    for pat in _EXERCISE_RE:
        if pat.search(t):
            return "exercise"
    for pat in _GLOSSARY_RE:
        if pat.search(t):
            return "glossary"
    for pat in _SIDEBAR_RE:
        if pat.search(t):
            return "sidebar"
    if is_caption_text(t):
        return "caption"
    for pat in _TIMELINE_RE:
        if pat.search(t):
            return "timeline"
    if _QUOTE_RE.search(t) or (block.italic and len(t) < 200):
        return "quote"
    for pat in _HEADING_RE:
        if pat.search(t):
            return "heading"

    size = block.font_size or 0
    if size >= 12 and block.bold and len(t) < 120:
        return "heading"
    if any(t.startswith(p) for p in _TOPIC_PREFIXES) and len(t) < 80 and size >= 11:
        return "heading"

    if in_colored_box or _in_sidebar_region(block.coordinates):
        if len(t) < 300:
            return "sidebar"

    return "paragraph"


def _layout_to_content(
    layout: LayoutBlock,
    page: int,
    colored_boxes: list[Coordinates],
    image_regions: list[Coordinates],
) -> ContentBlock | None:
    if layout.type in _SKIP_LAYOUT:
        return None

    if should_skip_map_label(layout, image_regions):
        return None

    if layout.type == "text" and is_page_marker_layout(layout):
        return None

    in_box = any(_overlap_ratio(layout.coordinates, box) > 0.4 for box in colored_boxes)

    if layout.type == "image":
        cb_type = "image"
        text = layout.text or "image"
    elif layout.type == "table":
        cb_type = "table"
        text = layout.text
    elif layout.type == "colored_box":
        return None
    elif layout.type == "text":
        text = layout.text or ""
        if not text.strip():
            return None
        cb_type = _classify_text(text, layout, in_box)
    else:
        return None

    return ContentBlock(
        block_id="",
        page=page,
        type=cb_type,
        text=text,
        reading_position=layout.reading_position,
        coordinates=layout.coordinates,
        font=layout.font,
        font_size=layout.font_size,
        bold=layout.bold,
        italic=layout.italic,
        color=layout.color,
        layout_source=layout.type,
    )


def build_content_blocks(layout_result: Step02LayoutResult) -> Step03ContentBlockResult:
    blocks: list[ContentBlock] = []
    counter = 0

    for page_layout in layout_result.pages:
        colored_boxes = [
            b.coordinates
            for b in page_layout.blocks
            if b.type == "colored_box"
        ]
        image_regions = large_image_regions(page_layout)
        for layout_block in page_layout.blocks:
            cb = _layout_to_content(
                layout_block, page_layout.page, colored_boxes, image_regions
            )
            if cb is None:
                continue
            counter += 1
            cb = cb.model_copy(update={"block_id": f"CB{counter:06d}"})
            blocks.append(cb)

    block_counts: dict[str, int] = {}
    for b in blocks:
        block_counts[b.type] = block_counts.get(b.type, 0) + 1

    validation = _validate(blocks, layout_result)
    return Step03ContentBlockResult(
        source=layout_result.source,
        total_pages=layout_result.total_pages,
        total_blocks=len(blocks),
        block_counts=block_counts,
        blocks=blocks,
        validation=validation,
    )


def _validate(
    blocks: list[ContentBlock],
    layout_result: Step02LayoutResult,
) -> Step03Validation:
    errors: list[str] = []

    ids = [b.block_id for b in blocks]
    if len(ids) != len(set(ids)):
        errors.append("Duplicate block IDs detected")

    if not blocks:
        errors.append("No content blocks produced")

    mappable = 0
    for page in layout_result.pages:
        image_regions = large_image_regions(page)
        for lb in page.blocks:
            if lb.type in _SKIP_LAYOUT or lb.type == "colored_box":
                continue
            if lb.type == "text" and not (lb.text or "").strip():
                continue
            if should_skip_map_label(lb, image_regions):
                continue
            if lb.type == "text" and is_page_marker_layout(lb):
                continue
            mappable += 1

    if len(blocks) < mappable:
        errors.append(
            f"Not all layout objects mapped: {len(blocks)} content blocks from {mappable} layout objects"
        )

    return Step03Validation(
        all_blocks_mapped=len(blocks) >= mappable and mappable > 0,
        unique_block_ids=len(ids) == len(set(ids)),
        errors=errors,
    )


def build_from_step02_path(step02_path: Path) -> Step03ContentBlockResult:
    data = json.loads(step02_path.read_text(encoding="utf-8"))
    layout_result = Step02LayoutResult(**data)
    return build_content_blocks(layout_result)


def run_step03(step02_path: Path, output_path: Path | None = None) -> Step03ContentBlockResult:
    result = build_from_step02_path(step02_path)
    if output_path is not None:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result
