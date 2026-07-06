"""
STEP 2 — Layout Extraction
==========================
Extract every visual object from every page (no AI).

Block types: text, image, table, line, shape, colored_box
"""

from __future__ import annotations

from pathlib import Path

import fitz  # pymupdf

from backend.pipeline.models import (
    Coordinates,
    LayoutBlock,
    PageLayout,
    Step02LayoutResult,
    Step02Validation,
)

_BOLD = 16
_ITALIC = 2


def _coords(bbox: tuple[float, ...] | fitz.Rect) -> Coordinates:
    if isinstance(bbox, fitz.Rect):
        x0, y0, x1, y1 = bbox.x0, bbox.y0, bbox.x1, bbox.y1
    else:
        x0, y0, x1, y1 = bbox
    return Coordinates(
        x0=round(min(x0, x1), 2),
        y0=round(min(y0, y1), 2),
        x1=round(max(x0, x1), 2),
        y1=round(max(y0, y1), 2),
    )


def _int_color_to_hex(color: int) -> str | None:
    if color is None or color < 0:
        return None
    r = (color >> 16) & 0xFF
    g = (color >> 8) & 0xFF
    b = color & 0xFF
    return f"#{r:02x}{g:02x}{b:02x}"


def _rgb_to_hex(rgb: tuple[float, ...] | None) -> str | None:
    if not rgb:
        return None
    parts = [max(0, min(255, int(c * 255))) for c in rgb[:3]]
    return f"#{parts[0]:02x}{parts[1]:02x}{parts[2]:02x}"


def _merge_span_text(spans: list[dict]) -> tuple[str, str | None, float | None, bool, bool, str | None]:
    parts: list[str] = []
    font: str | None = None
    size: float | None = None
    bold = False
    italic = False
    color: str | None = None
    best_len = -1

    for span in spans:
        text = span.get("text", "")
        if text:
            parts.append(text)
        span_size = span.get("size")
        span_text_len = len(text)
        if span_text_len > best_len:
            best_len = span_text_len
            font = span.get("font")
            size = round(span_size, 2) if span_size else None
            flags = span.get("flags", 0)
            bold = bool(flags & _BOLD)
            italic = bool(flags & _ITALIC)
            color = _int_color_to_hex(span.get("color"))

    return "".join(parts).strip(), font, size, bold, italic, color


def _extract_text_blocks(page_dict: dict) -> list[LayoutBlock]:
    blocks: list[LayoutBlock] = []
    for block in page_dict.get("blocks", []):
        if block.get("type") != 0:
            continue
        spans: list[dict] = []
        for line in block.get("lines", []):
            spans.extend(line.get("spans", []))
        if not spans:
            continue
        text, font, size, bold, italic, color = _merge_span_text(spans)
        if not text:
            continue
        blocks.append(
            LayoutBlock(
                type="text",
                reading_position=0,
                coordinates=_coords(block["bbox"]),
                text=text,
                font=font,
                font_size=size,
                bold=bold,
                italic=italic,
                color=color,
            )
        )
    return blocks


def _extract_image_blocks(page_dict: dict) -> list[LayoutBlock]:
    blocks: list[LayoutBlock] = []
    for block in page_dict.get("blocks", []):
        if block.get("type") != 1:
            continue
        blocks.append(
            LayoutBlock(
                type="image",
                reading_position=0,
                coordinates=_coords(block["bbox"]),
                text=f"image/{block.get('ext', 'unknown')}",
            )
        )
    return blocks


def _extract_table_blocks(page: fitz.Page) -> list[LayoutBlock]:
    blocks: list[LayoutBlock] = []
    try:
        finder = page.find_tables()
        for table in finder.tables:
            rows = table.extract() or []
            preview = " | ".join(
                cell or "" for row in rows[:2] for cell in (row or [])[:4]
            ).strip()
            blocks.append(
                LayoutBlock(
                    type="table",
                    reading_position=0,
                    coordinates=_coords(table.bbox),
                    text=preview[:500] if preview else None,
                )
            )
    except Exception:
        pass
    return blocks


def _classify_drawing(drawing: dict) -> tuple[str, str | None]:
    items = drawing.get("items") or []
    fill = drawing.get("fill")
    stroke = drawing.get("color")
    has_line = any(item[0] == "l" for item in items)
    has_rect = any(item[0] == "re" for item in items)

    if fill and has_rect:
        return "colored_box", _rgb_to_hex(fill)
    if has_line and not fill:
        return "line", _rgb_to_hex(stroke) if stroke else None
    return "shape", _rgb_to_hex(stroke) if stroke else _rgb_to_hex(fill)


def _extract_drawing_blocks(page: fitz.Page) -> list[LayoutBlock]:
    blocks: list[LayoutBlock] = []
    for drawing in page.get_drawings():
        rect = drawing.get("rect")
        if rect is None:
            continue
        block_type, color = _classify_drawing(drawing)
        blocks.append(
            LayoutBlock(
                type=block_type,
                reading_position=0,
                coordinates=_coords(rect),
                color=color,
            )
        )
    return blocks


def _assign_reading_positions(blocks: list[LayoutBlock]) -> list[LayoutBlock]:
    ordered = sorted(blocks, key=lambda b: (b.coordinates.y0, b.coordinates.x0))
    result: list[LayoutBlock] = []
    for i, block in enumerate(ordered, start=1):
        result.append(block.model_copy(update={"reading_position": i}))
    return result


def extract_page_layout(page: fitz.Page, page_number: int) -> PageLayout:
    page_dict = page.get_text("dict")
    blocks: list[LayoutBlock] = []
    blocks.extend(_extract_text_blocks(page_dict))
    blocks.extend(_extract_image_blocks(page_dict))
    blocks.extend(_extract_table_blocks(page))
    blocks.extend(_extract_drawing_blocks(page))
    blocks = _assign_reading_positions(blocks)
    return PageLayout(page=page_number, blocks=blocks)


def extract_layout(pdf_path: Path) -> Step02LayoutResult:
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    doc = fitz.open(pdf_path)
    try:
        pages: list[PageLayout] = []
        block_counts: dict[str, int] = {
            "text": 0,
            "image": 0,
            "table": 0,
            "line": 0,
            "shape": 0,
            "colored_box": 0,
        }

        for index in range(doc.page_count):
            page = doc.load_page(index)
            page_layout = extract_page_layout(page, index + 1)
            pages.append(page_layout)
            for block in page_layout.blocks:
                block_counts[block.type] = block_counts.get(block.type, 0) + 1

        validation = _validate_layout(pages, doc.page_count)
        total_blocks = sum(block_counts.values())

        return Step02LayoutResult(
            source=str(pdf_path.resolve()),
            total_pages=doc.page_count,
            total_blocks=total_blocks,
            block_counts=block_counts,
            pages=pages,
            validation=validation,
        )
    finally:
        doc.close()


def _validate_layout(pages: list[PageLayout], expected_count: int) -> Step02Validation:
    errors: list[str] = []

    if len(pages) != expected_count:
        errors.append(f"Page count mismatch: {len(pages)} vs {expected_count}")

    page_nums = {p.page for p in pages}
    missing = sorted(set(range(1, expected_count + 1)) - page_nums)
    if missing:
        errors.append(f"Missing pages in layout output: {missing[:10]}")

    invalid_coords = 0
    for page in pages:
        for block in page.blocks:
            c = block.coordinates
            if c.x1 < c.x0 or c.y1 < c.y0:
                invalid_coords += 1
                if invalid_coords <= 5:
                    errors.append(
                        f"Page {page.page} block {block.reading_position}: invalid bbox"
                    )

    if invalid_coords > 5:
        errors.append(f"...and {invalid_coords - 5} more invalid coordinates")

    no_missing = len(pages) == expected_count and not missing
    coords_valid = invalid_coords == 0

    return Step02Validation(
        no_missing_blocks=no_missing,
        coordinates_valid=coords_valid,
        errors=errors,
    )


def run_step02(pdf_path: Path, output_path: Path | None = None) -> Step02LayoutResult:
    result = extract_layout(pdf_path)
    if output_path is not None:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result
