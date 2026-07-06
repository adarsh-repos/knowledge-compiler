"""
STEP 5 — Block Classification
=============================
Assign semantic role to each block using layout rules (no AI).

Pink background → activity
Yellow box → glossary
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from backend.pipeline.cover_pages import detect_cover_pdf_pages
from backend.pipeline.content_filters import (
    can_merge_activity_fragments,
    can_merge_glossary_fragments,
    consolidate_role_fragments,
    attach_orphan_activity_labels,
    is_activity_box_color,
    is_glossary_box_color,
    is_glossary_text,
    is_page_marker_text,
)
from backend.pipeline.map_detection import large_image_regions, should_skip_map_label
from backend.pipeline.models import (
    BlockRole,
    ClassifiedBlock,
    Coordinates,
    LayoutBlock,
    OrderedContentBlock,
    Step02LayoutResult,
    Step04ReadingOrderResult,
    Step05ClassificationResult,
    Step05Validation,
)

_SECTION_RE = re.compile(r"^(\d+)\s{1,2}([A-Z\u2018\u2019].+)$")
_SUBSECTION_RE = re.compile(r"^(\d+\.\d+)\s+(.+)$")
_CHAPTER_MARKER_RE = re.compile(r"^Chapter\s+([IVXLC]+)\s*$", re.I)
_BOOK_SECTION_RE = re.compile(r"^Section\s+[IVXLC]+:", re.I)


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int] | None:
    if not hex_color or not hex_color.startswith("#") or len(hex_color) < 7:
        return None
    try:
        return (
            int(hex_color[1:3], 16),
            int(hex_color[3:5], 16),
            int(hex_color[5:7], 16),
        )
    except ValueError:
        return None


def _is_pink(rgb: tuple[int, int, int]) -> bool:
    return is_activity_box_color(rgb)


def _is_yellow(rgb: tuple[int, int, int]) -> bool:
    return is_glossary_box_color(rgb)


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


def _colored_regions(step02: Step02LayoutResult) -> dict[int, list[tuple[Coordinates, str]]]:
    regions: dict[int, list[tuple[Coordinates, str]]] = {}
    for page in step02.pages:
        for block in page.blocks:
            if block.type != "colored_box" or not block.color:
                continue
            regions.setdefault(page.page, []).append((block.coordinates, block.color))
    return regions


def _image_regions_by_page(step02: Step02LayoutResult) -> dict[int, list[Coordinates]]:
    regions: dict[int, list[Coordinates]] = {}
    for page in step02.pages:
        imgs = large_image_regions(page)
        if imgs:
            regions[page.page] = imgs
    return regions


def _in_colored_region(
    coords: Coordinates | None,
    page: int,
    regions: dict[int, list[tuple[Coordinates, str]]],
    color_check,
) -> bool:
    if coords is None:
        return False
    for box_coords, hex_color in regions.get(page, []):
        if _overlap_ratio(coords, box_coords) < 0.35:
            continue
        rgb = _hex_to_rgb(hex_color)
        if rgb and color_check(rgb):
            return True
    return False


def _classify_role(
    block: OrderedContentBlock,
    regions: dict[int, list[tuple[Coordinates, str]]],
    cover_pages: set[int],
    image_regions: dict[int, list[Coordinates]],
) -> BlockRole:
    text = (block.text or "").strip()
    btype = block.type
    coords = block.coordinates

    if block.page in cover_pages:
        return "cover"

    page_images = image_regions.get(block.page, [])
    if page_images and coords and btype != "image":
        layout_probe = LayoutBlock(
            type="text",
            reading_position=0,
            coordinates=coords,
            text=text,
        )
        if should_skip_map_label(layout_probe, page_images):
            return "map_embedded"

    if is_page_marker_text(text, coords):
        return "fragment"

    if is_glossary_text(text, btype):
        return "glossary"
    if _in_colored_region(coords, block.page, regions, _is_pink) or btype == "activity":
        return "activity"
    if _in_colored_region(coords, block.page, regions, _is_yellow):
        return "glossary"

    if _BOOK_SECTION_RE.match(text):
        return "front_matter"
    if re.match(r"^(Contents|Foreword|Preface|Acknowledgements?)\b", text, re.I):
        return "front_matter"

    if btype == "image":
        return "figure"
    if btype == "table":
        return "table"
    if btype == "caption":
        return "caption"
    if btype == "exercise":
        return "exercise"
    if btype == "quote":
        return "quote"
    if btype == "timeline":
        return "timeline"
    if btype == "sidebar":
        return "sidebar"

    if _CHAPTER_MARKER_RE.match(text):
        return "chapter"
    if _SUBSECTION_RE.match(text):
        return "subsection"
    if _SECTION_RE.match(text):
        return "section"
    if btype == "heading":
        return "chapter_title"

    if block.italic and len(text) < 250 and "\n" in text:
        return "poem"
    if block.italic and len(text) < 120 and text.endswith((".", "!", "?")):
        return "quote"

    return "paragraph"


def classify_blocks(
    step04: Step04ReadingOrderResult,
    step02: Step02LayoutResult,
) -> Step05ClassificationResult:
    regions = _colored_regions(step02)
    image_regions = _image_regions_by_page(step02)
    cover_pages = detect_cover_pdf_pages(step02, step04=step04)
    classified: list[ClassifiedBlock] = []
    role_counts: dict[str, int] = {}

    for block in step04.blocks:
        role = _classify_role(block, regions, cover_pages, image_regions)
        classified.append(ClassifiedBlock(**block.model_dump(), role=role))

    classified = consolidate_role_fragments(classified, "glossary", can_merge_glossary_fragments)
    classified = consolidate_role_fragments(classified, "activity", can_merge_activity_fragments)
    classified = attach_orphan_activity_labels(classified)

    role_counts: dict[str, int] = {}
    for block in classified:
        role_counts[block.role] = role_counts.get(block.role, 0) + 1

    errors: list[str] = []
    if len(classified) != len(step04.blocks):
        errors.append("Not all blocks classified")

    return Step05ClassificationResult(
        source=step04.source,
        total_pages=step04.total_pages,
        total_blocks=len(classified),
        role_counts=role_counts,
        blocks=classified,
        validation=Step05Validation(
            all_blocks_classified=len(classified) == len(step04.blocks) and not errors,
            errors=errors,
        ),
    )


def run_step05(
    step04_path: Path,
    step02_path: Path,
    output_path: Path | None = None,
) -> Step05ClassificationResult:
    step04 = Step04ReadingOrderResult(**json.loads(step04_path.read_text(encoding="utf-8")))
    step02 = Step02LayoutResult(**json.loads(step02_path.read_text(encoding="utf-8")))
    result = classify_blocks(step04, step02)
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result
