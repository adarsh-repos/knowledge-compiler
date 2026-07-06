"""
STEP 7 — Paragraph Builder
============================
Merge paragraph-role text blocks into logical paragraphs (no AI).
"""

from __future__ import annotations

import json
from pathlib import Path

from backend.pipeline.models import (
    ClassifiedBlock,
    ParagraphBlock,
    Step05ClassificationResult,
    Step07ParagraphResult,
    Step07Validation,
)

_MAX_VERTICAL_GAP = 22.0
_FONT_SIZE_TOLERANCE = 0.6


def _can_merge(prev: ClassifiedBlock, curr: ClassifiedBlock) -> bool:
    if prev.role != "paragraph" or curr.role != "paragraph":
        return False
    if prev.page != curr.page:
        return False
    if prev.font and curr.font and prev.font != curr.font:
        return False
    ps, cs = prev.font_size or 0, curr.font_size or 0
    if ps and cs and abs(ps - cs) > _FONT_SIZE_TOLERANCE:
        return False
    if prev.coordinates and curr.coordinates:
        gap = curr.coordinates.y0 - prev.coordinates.y1
        if gap > _MAX_VERTICAL_GAP:
            return False
        if curr.coordinates.y0 < prev.coordinates.y1 - 2:
            return False
    return True


def build_paragraphs(step05: Step05ClassificationResult) -> Step07ParagraphResult:
    all_blocks = step05.blocks  # already in reading_order
    paragraphs: list[ParagraphBlock] = []
    counter = 0
    paragraph_block_count = sum(1 for b in all_blocks if b.role == "paragraph")

    i = 0
    while i < len(all_blocks):
        if all_blocks[i].role != "paragraph":
            i += 1
            continue

        start = all_blocks[i]
        merged_ids = [start.block_id]
        texts = [(start.text or "").strip()]
        font = start.font
        font_size = start.font_size
        page = start.page

        j = i + 1
        while j < len(all_blocks) and all_blocks[j].role == "paragraph":
            if not _can_merge(all_blocks[j - 1], all_blocks[j]):
                break
            blk = all_blocks[j]
            merged_ids.append(blk.block_id)
            texts.append((blk.text or "").strip())
            j += 1

        counter += 1
        paragraphs.append(
            ParagraphBlock(
                paragraph_id=f"P{counter:05d}",
                page=page,
                text=" ".join(t for t in texts if t),
                source_block_ids=merged_ids,
                font=font,
                font_size=font_size,
            )
        )
        i = j

    errors: list[str] = []
    merged_ids_flat = {bid for p in paragraphs for bid in p.source_block_ids}
    source_ids = {b.block_id for b in all_blocks if b.role == "paragraph"}
    if merged_ids_flat != source_ids:
        errors.append("Some paragraph blocks missing from merge output")
    paragraph_blocks_by_id = {b.block_id: b for b in all_blocks if b.role == "paragraph"}
    for p in paragraphs:
        if len(p.source_block_ids) > 1:
            fonts = {
                paragraph_blocks_by_id[bid].font
                for bid in p.source_block_ids
                if bid in paragraph_blocks_by_id and paragraph_blocks_by_id[bid].font
            }
            if len(fonts) > 1:
                errors.append(f"Paragraph {p.paragraph_id} merged different fonts")

    return Step07ParagraphResult(
        source=step05.source,
        total_paragraphs=len(paragraphs),
        source_paragraph_blocks=paragraph_block_count,
        paragraphs=paragraphs,
        validation=Step07Validation(
            no_incorrect_splits=merged_ids_flat == source_ids,
            no_incorrect_merges=not any("merged different fonts" in e for e in errors),
            errors=errors,
        ),
    )


def run_step07(step05_path: Path, output_path: Path | None = None) -> Step07ParagraphResult:
    step05 = Step05ClassificationResult(**json.loads(step05_path.read_text(encoding="utf-8")))
    result = build_paragraphs(step05)
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result
