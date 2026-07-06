"""
STEP 8 — Image & Table Builder
==============================
Extract images, figures, tables, activities, and glossaries (no AI).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import fitz

from backend.pipeline.models import (
    ActivityRecord,
    BlockPosition,
    ClassifiedBlock,
    Coordinates,
    ExtractedImage,
    ExtractedTable,
    FigureRecord,
    GlossaryEntry,
    GlossaryRecord,
    Step05ClassificationResult,
    Step08ImageTableResult,
    Step08Validation,
    TableCell,
)

from backend.pipeline.content_filters import parse_activity_content
_CAPTION_TEXT_RE = re.compile(r"(Fig\.?|Figure|Map)\s*\d", re.I)
_SIDEBAR_CAPTION_RE = re.compile(
    r"(?:^|\b)(?:[A-D]|Top(?:\s+Right|\s+Left)?|Bottom(?:\s+Left|\s+Right)?|Left|Right)\s*:\s+",
    re.I,
)


def _overlap_ratio(a: Coordinates, b: Coordinates) -> float:
    x0 = max(a.x0, b.x0)
    y0 = max(a.y0, b.y0)
    x1 = min(a.x1, b.x1)
    y1 = min(a.y1, b.y1)
    if x1 <= x0 or y1 <= y0:
        return 0.0
    inter = (x1 - x0) * (y1 - y0)
    inner_area = max((a.x1 - a.x0) * (a.y1 - a.y0), 1.0)
    return inter / inner_area


def _position(block: ClassifiedBlock) -> BlockPosition:
    return BlockPosition(
        page=block.page,
        reading_order=block.reading_order,
        coordinates=block.coordinates or Coordinates(x0=0, y0=0, x1=0, y1=0),
    )


def _extract_image_file(
    page: fitz.Page,
    coords: Coordinates,
    out_path: Path,
) -> tuple[int, int]:
    rect = fitz.Rect(coords.x0, coords.y0, coords.x1, coords.y1)
    if rect.width < 4 or rect.height < 4:
        rect = fitz.Rect(coords.x0, coords.y0, coords.x0 + 80, coords.y0 + 80)
    pix = page.get_pixmap(clip=rect, matrix=fitz.Matrix(2, 2))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    pix.save(str(out_path))
    return pix.width, pix.height


def _is_caption_candidate(block: ClassifiedBlock) -> bool:
    text = (block.text or "").strip()
    if not text:
        return False
    if block.role == "caption" or block.type == "caption":
        return True
    if _CAPTION_TEXT_RE.search(text):
        return True
    if _SIDEBAR_CAPTION_RE.search(text) and len(text) < 250:
        return True
    if block.italic and len(text) < 180 and block.role in ("paragraph", "quote"):
        return True
    return False


def _link_captions_for_figures(
    blocks: list[ClassifiedBlock],
) -> dict[str, ClassifiedBlock]:
    """Pair each figure with the next caption candidate in reading order on its page."""
    by_page: dict[int, list[ClassifiedBlock]] = {}
    for block in blocks:
        by_page.setdefault(block.page, []).append(block)

    links: dict[str, ClassifiedBlock] = {}
    for page_blocks in by_page.values():
        page_blocks.sort(key=lambda b: b.reading_order)
        used: set[str] = set()
        for fig in page_blocks:
            if fig.role != "figure":
                continue
            for block in page_blocks:
                if block.reading_order <= fig.reading_order:
                    continue
                if block.block_id in used:
                    continue
                if block.role == "figure":
                    break
                if _is_caption_candidate(block):
                    links[fig.block_id] = block
                    used.add(block.block_id)
                    break
    return links


def _extract_table(
    page: fitz.Page,
    coords: Coordinates,
) -> tuple[int, int, list[TableCell]]:
    try:
        finder = page.find_tables()
        best_cells: list[TableCell] = []
        best_rows = 0
        best_cols = 0
        best_score = 0.0

        for table in finder.tables:
            table_coords = Coordinates(
                x0=table.bbox[0], y0=table.bbox[1], x1=table.bbox[2], y1=table.bbox[3]
            )
            score = _overlap_ratio(coords, table_coords)
            if score <= best_score:
                continue

            rows_data = table.extract() or []
            cells: list[TableCell] = []
            max_cols = 0
            for r, row in enumerate(rows_data):
                if not row:
                    continue
                max_cols = max(max_cols, len(row))
                for c, cell in enumerate(row):
                    cells.append(TableCell(row=r, col=c, text=(cell or "").strip()))

            if cells:
                best_score = score
                best_cells = cells
                best_rows = len(rows_data)
                best_cols = max_cols

        if best_cells:
            return best_rows, best_cols, best_cells
    except Exception:
        pass

    return 0, 0, []


def _collect_merged_group(
    blocks: list[ClassifiedBlock],
    start: int,
) -> tuple[int, list[str], str]:
    """Collect primary block plus following fragment siblings."""
    source_ids = [blocks[start].block_id]
    page = blocks[start].page
    j = start + 1
    while j < len(blocks):
        nxt = blocks[j]
        if nxt.page != page:
            break
        if nxt.role == "fragment":
            source_ids.append(nxt.block_id)
            j += 1
            continue
        if nxt.role == "sidebar":
            j += 1
            continue
        break
    combined = (blocks[start].text or "").strip()
    return j, source_ids, combined


_GLOSSARY_LINE_RE = re.compile(r"^(.+?)\s+[–\-:]\s+(.+)$")


def _parse_glossary(text: str) -> list[GlossaryEntry]:
    entries: list[GlossaryEntry] = []
    for line in (text or "").split("\n"):
        line = line.strip()
        if not line or re.match(r"^(New words|Glossary)\s*$", line, re.I):
            continue
        m = _GLOSSARY_LINE_RE.match(line)
        if m:
            entries.append(GlossaryEntry(word=m.group(1).strip(), meaning=m.group(2).strip()))
    return entries


def build_image_table_content(
    step05: Step05ClassificationResult,
    pdf_path: Path,
    images_dir: Path,
) -> Step08ImageTableResult:
    blocks = step05.blocks
    doc = fitz.open(pdf_path)

    images: list[ExtractedImage] = []
    figures: list[FigureRecord] = []
    tables: list[ExtractedTable] = []
    activities: list[ActivityRecord] = []
    glossaries: list[GlossaryRecord] = []

    img_counter = 0
    fig_counter = 0
    tbl_counter = 0
    act_counter = 0
    gloss_counter = 0
    caption_links = _link_captions_for_figures(blocks)

    figure_blocks = [b for b in blocks if b.role == "figure"]

    try:
        i = 0
        while i < len(blocks):
            block = blocks[i]
            if block.role == "fragment":
                i += 1
                continue

            if block.role == "figure" and block.coordinates:
                page = doc.load_page(block.page - 1)
                img_counter += 1
                image_id = f"IMG{img_counter:05d}"
                filename = f"{image_id}_p{block.page}.png"
                out_path = images_dir / filename
                width, height = _extract_image_file(page, block.coordinates, out_path)

                position = _position(block)
                images.append(
                    ExtractedImage(
                        image_id=image_id,
                        block_id=block.block_id,
                        page=block.page,
                        file_path=str(out_path.relative_to(images_dir.parent)),
                        width=width,
                        height=height,
                        position=position,
                    )
                )

                caption_block = caption_links.get(block.block_id)
                caption_text: str | None = None
                caption_block_id: str | None = None
                if caption_block:
                    caption_block_id = caption_block.block_id
                    caption_text = (caption_block.text or "").strip()

                fig_counter += 1
                figures.append(
                    FigureRecord(
                        figure_id=f"FIG{fig_counter:05d}",
                        image_id=image_id,
                        block_id=block.block_id,
                        caption_block_id=caption_block_id,
                        caption=caption_text,
                        page=block.page,
                        position=position,
                    )
                )

                i += 1

            elif block.role == "table" and block.coordinates:
                page = doc.load_page(block.page - 1)
                rows, cols, cells = _extract_table(page, block.coordinates)
                tbl_counter += 1
                tables.append(
                    ExtractedTable(
                        table_id=f"TBL{tbl_counter:05d}",
                        block_id=block.block_id,
                        page=block.page,
                        rows=rows,
                        columns=cols,
                        cells=cells,
                        position=_position(block),
                    )
                )

                i += 1

            elif block.role == "activity":
                j, source_ids, combined = _collect_merged_group(blocks, i)
                title, body, activity_type = parse_activity_content(combined)
                if body.strip():
                    act_counter += 1
                    activities.append(
                        ActivityRecord(
                            activity_id=f"ACT{act_counter:05d}",
                            block_id=source_ids[0],
                            page=block.page,
                            title=title,
                            body=body,
                            activity_type=activity_type,
                            source_block_ids=source_ids,
                            position=_position(block),
                        )
                    )
                i = j

            elif block.role == "glossary":
                j, source_ids, combined = _collect_merged_group(blocks, i)
                entries = _parse_glossary(combined)
                if entries:
                    gloss_counter += 1
                    glossaries.append(
                        GlossaryRecord(
                            glossary_id=f"GLO{gloss_counter:05d}",
                            block_id=source_ids[0],
                            page=block.page,
                            entries=entries,
                            position=_position(block),
                        )
                    )
                i = j

            else:
                i += 1
    finally:
        doc.close()

    errors: list[str] = []

    required = len(caption_links)
    linked = sum(1 for f in figures if f.caption_block_id)

    caption_linked = required == 0 or linked == required
    if required > linked:
        errors.append(f"{required - linked} figures missing linked caption (of {required} requiring one)")

    images_detected = len(images) == len(figure_blocks)
    if not images_detected:
        errors.append(f"Image count mismatch: {len(images)} extracted vs {len(figure_blocks)} figures")

    table_blocks = [b for b in blocks if b.role == "table"]
    empty_tables = [t for t in tables if t.rows == 0 or not t.cells]
    tables_preserved = len(tables) == len(table_blocks) and not empty_tables
    if len(tables) != len(table_blocks):
        errors.append(f"Table count mismatch: {len(tables)} extracted vs {len(table_blocks)} blocks")
    if empty_tables:
        errors.append(f"{len(empty_tables)} tables missing cell data")

    return Step08ImageTableResult(
        source=step05.source,
        images=images,
        figures=figures,
        tables=tables,
        activities=activities,
        glossaries=glossaries,
        validation=Step08Validation(
            caption_linked=caption_linked,
            images_detected=images_detected,
            tables_preserved=tables_preserved,
            errors=errors,
        ),
    )


def run_step08(
    step05_path: Path,
    pdf_path: Path,
    output_path: Path | None = None,
    images_dir: Path | None = None,
) -> Step08ImageTableResult:
    step05 = Step05ClassificationResult(**json.loads(step05_path.read_text(encoding="utf-8")))
    if images_dir is None:
        images_dir = step05_path.parent / "images"
    result = build_image_table_content(step05, pdf_path, images_dir)
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result
