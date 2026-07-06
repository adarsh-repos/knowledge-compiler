"""
STEP 9 — Validation Engine
============================
Mandatory cross-step validation. Pipeline must stop if any check fails.
"""

from __future__ import annotations

import json
from pathlib import Path

from backend.pipeline.models import (
    Coordinates,
    Step01PdfReaderResult,
    Step02LayoutResult,
    Step03ContentBlockResult,
    Step04ReadingOrderResult,
    Step05ClassificationResult,
    Step06HierarchyResult,
    Step07ParagraphResult,
    Step08ImageTableResult,
    Step09Validation,
    Step09ValidationResult,
    ValidationCheck,
)
from backend.pipeline.step08_image_table_builder import _link_captions_for_figures


def _coords_valid(coords: Coordinates) -> bool:
    return coords.x1 >= coords.x0 and coords.y1 >= coords.y0


def _check_missing_pages(
    step01: Step01PdfReaderResult,
    step02: Step02LayoutResult,
) -> ValidationCheck:
    errors: list[str] = []
    expected = step01.total_pages
    step01_pages = {p.page for p in step01.pages}
    step02_pages = {p.page for p in step02.pages}

    missing01 = sorted(set(range(1, expected + 1)) - step01_pages)
    missing02 = sorted(set(range(1, expected + 1)) - step02_pages)

    if missing01:
        errors.append(f"Step 1 missing pages: {missing01[:10]}")
    if missing02:
        errors.append(f"Step 2 missing pages: {missing02[:10]}")
    if len(step01.pages) != expected:
        errors.append(f"Step 1 page count {len(step01.pages)} != {expected}")
    if len(step02.pages) != expected:
        errors.append(f"Step 2 page count {len(step02.pages)} != {expected}")

    return ValidationCheck(name="missing_pages", passed=not errors, errors=errors)


def _check_missing_paragraphs(
    step05: Step05ClassificationResult,
    step07: Step07ParagraphResult,
) -> ValidationCheck:
    errors: list[str] = []
    paragraph_block_ids = {b.block_id for b in step05.blocks if b.role == "paragraph"}
    merged_ids = {bid for p in step07.paragraphs for bid in p.source_block_ids}

    missing = paragraph_block_ids - merged_ids
    if missing:
        errors.append(f"{len(missing)} paragraph blocks not merged in step 7")
        errors.extend(sorted(missing)[:5])

    empty_paragraphs = [p.paragraph_id for p in step07.paragraphs if not p.text.strip()]
    if empty_paragraphs:
        errors.append(f"{len(empty_paragraphs)} empty paragraphs in step 7")

    return ValidationCheck(name="missing_paragraphs", passed=not errors, errors=errors)


def _check_duplicate_blocks(step05: Step05ClassificationResult) -> ValidationCheck:
    errors: list[str] = []
    seen: dict[str, int] = {}
    for block in step05.blocks:
        key = (
            block.page,
            block.reading_order,
            block.role,
            (block.text or "")[:80],
        )
        seen[key] = seen.get(key, 0) + 1

    dupes = [k for k, count in seen.items() if count > 1]
    if dupes:
        errors.append(f"{len(dupes)} duplicate block signatures detected")

    return ValidationCheck(name="duplicate_blocks", passed=not errors, errors=errors)


def _check_duplicate_ids(
    step03: Step03ContentBlockResult,
    step05: Step05ClassificationResult,
    step07: Step07ParagraphResult,
    step08: Step08ImageTableResult,
) -> ValidationCheck:
    errors: list[str] = []

    block_ids = [b.block_id for b in step05.blocks]
    if len(block_ids) != len(set(block_ids)):
        errors.append("Duplicate block_id in step 5")

    step03_ids = [b.block_id for b in step03.blocks]
    if len(step03_ids) != len(set(step03_ids)):
        errors.append("Duplicate block_id in step 3")

    para_ids = [p.paragraph_id for p in step07.paragraphs]
    if len(para_ids) != len(set(para_ids)):
        errors.append("Duplicate paragraph_id in step 7")

    image_ids = [i.image_id for i in step08.images]
    if len(image_ids) != len(set(image_ids)):
        errors.append("Duplicate image_id in step 8")

    figure_ids = [f.figure_id for f in step08.figures]
    if len(figure_ids) != len(set(figure_ids)):
        errors.append("Duplicate figure_id in step 8")

    table_ids = [t.table_id for t in step08.tables]
    if len(table_ids) != len(set(table_ids)):
        errors.append("Duplicate table_id in step 8")

    return ValidationCheck(name="duplicate_ids", passed=not errors, errors=errors)


def _check_empty_blocks(step05: Step05ClassificationResult) -> ValidationCheck:
    errors: list[str] = []
    exempt_types = {"image", "table"}
    exempt_roles = {"figure", "table"}

    empty = []
    for block in step05.blocks:
        if block.type in exempt_types or block.role in exempt_roles:
            continue
        text = (block.text or "").strip()
        if not text:
            empty.append(block.block_id)

    if empty:
        errors.append(f"{len(empty)} empty text blocks")
        errors.extend(empty[:5])

    return ValidationCheck(name="empty_blocks", passed=not errors, errors=errors)


def _check_broken_hierarchy(
    step05: Step05ClassificationResult,
    step06: Step06HierarchyResult,
) -> ValidationCheck:
    errors: list[str] = []
    all_block_ids = {b.block_id for b in step05.blocks}
    placed = set(step06.block_placements.keys())
    skipped = set(step06.skipped_block_ids or [])

    missing = all_block_ids - placed - skipped
    if missing:
        errors.append(f"{len(missing)} blocks not placed in hierarchy")
    if not step06.chapters:
        errors.append("No chapters in hierarchy")

    return ValidationCheck(
        name="broken_hierarchy",
        passed=not missing and bool(step06.chapters),
        errors=errors or list(step06.validation.errors),
    )


def _check_invalid_coordinates(step02: Step02LayoutResult) -> ValidationCheck:
    errors: list[str] = []
    invalid = 0

    for page in step02.pages:
        for block in page.blocks:
            c = block.coordinates
            if not _coords_valid(c):
                invalid += 1
                if invalid <= 5:
                    errors.append(f"Page {page.page} block {block.reading_position}: invalid bbox")

    if invalid > 5:
        errors.append(f"...and {invalid - 5} more invalid coordinates")

    return ValidationCheck(
        name="invalid_coordinates",
        passed=invalid == 0,
        errors=errors,
    )


def _check_reading_order(step04: Step04ReadingOrderResult) -> ValidationCheck:
    errors: list[str] = []
    orders = [b.reading_order for b in step04.blocks]

    if len(orders) != len(set(orders)):
        errors.append("Duplicate reading_order values")

    expected = list(range(1, len(orders) + 1))
    if sorted(orders) != expected:
        errors.append("Reading order is not sequential 1..N")

    prev = None
    for block in step04.blocks:
        if prev is not None:
            if block.page < prev.page:
                errors.append(f"Page order broken at reading_order {block.reading_order}")
                break
            if block.page == prev.page and block.coordinates and prev.coordinates:
                if block.coordinates.y0 < prev.coordinates.y1 - 5:
                    pass  # multi-column layout allowed
        prev = block

    return ValidationCheck(
        name="reading_order",
        passed=step04.validation.reading_sequence_correct
        and step04.validation.no_skipped_blocks
        and not errors,
        errors=errors or list(step04.validation.errors),
    )


def _check_images_with_captions(
    step05: Step05ClassificationResult,
    step08: Step08ImageTableResult,
) -> ValidationCheck:
    errors: list[str] = []
    caption_links = _link_captions_for_figures(step05.blocks)
    required = len(caption_links)

    linked = sum(1 for f in step08.figures if f.caption_block_id)
    if required > 0 and linked < required:
        errors.append(f"{required - linked} figures missing captions (of {required} requiring one)")

    if len(step08.images) != len(step08.figures):
        errors.append(
            f"Image/figure count mismatch: {len(step08.images)} images vs {len(step08.figures)} figures"
        )

    return ValidationCheck(
        name="images_with_captions",
        passed=step08.validation.caption_linked
        and step08.validation.images_detected
        and not errors,
        errors=errors or list(step08.validation.errors),
    )


def _check_tables_complete(
    step05: Step05ClassificationResult,
    step08: Step08ImageTableResult,
) -> ValidationCheck:
    errors: list[str] = []
    table_blocks = [b for b in step05.blocks if b.role == "table"]

    if len(step08.tables) != len(table_blocks):
        errors.append(
            f"Table count mismatch: {len(step08.tables)} extracted vs {len(table_blocks)} blocks"
        )

    incomplete = [t.table_id for t in step08.tables if t.rows == 0 or t.columns == 0 or not t.cells]
    if incomplete:
        errors.append(f"{len(incomplete)} tables missing row/column/cell data")

    return ValidationCheck(
        name="tables_complete",
        passed=step08.validation.tables_preserved and not errors,
        errors=errors or list(step08.validation.errors),
    )


def validate_pipeline(
    step01: Step01PdfReaderResult,
    step02: Step02LayoutResult,
    step03: Step03ContentBlockResult,
    step04: Step04ReadingOrderResult,
    step05: Step05ClassificationResult,
    step06: Step06HierarchyResult,
    step07: Step07ParagraphResult,
    step08: Step08ImageTableResult,
) -> Step09ValidationResult:
    checks = [
        _check_missing_pages(step01, step02),
        _check_missing_paragraphs(step05, step07),
        _check_duplicate_blocks(step05),
        _check_duplicate_ids(step03, step05, step07, step08),
        _check_empty_blocks(step05),
        _check_broken_hierarchy(step05, step06),
        _check_invalid_coordinates(step02),
        _check_reading_order(step04),
        _check_images_with_captions(step05, step08),
        _check_tables_complete(step05, step08),
    ]

    all_errors: list[str] = []
    for check in checks:
        if not check.passed:
            all_errors.append(f"{check.name}: {'; '.join(check.errors[:3])}")

    passed = all(c.passed for c in checks)
    passed_count = sum(1 for c in checks if c.passed)

    return Step09ValidationResult(
        source=step01.source,
        total_checks=len(checks),
        passed_checks=passed_count,
        validation=Step09Validation(
            passed=passed,
            checks=checks,
            errors=all_errors,
        ),
    )


def run_step09(
    step01_path: Path,
    step02_path: Path,
    step03_path: Path,
    step04_path: Path,
    step05_path: Path,
    step06_path: Path,
    step07_path: Path,
    step08_path: Path,
    output_path: Path | None = None,
) -> Step09ValidationResult:
    step01 = Step01PdfReaderResult(**json.loads(step01_path.read_text(encoding="utf-8")))
    step02 = Step02LayoutResult(**json.loads(step02_path.read_text(encoding="utf-8")))
    step03 = Step03ContentBlockResult(**json.loads(step03_path.read_text(encoding="utf-8")))
    step04 = Step04ReadingOrderResult(**json.loads(step04_path.read_text(encoding="utf-8")))
    step05 = Step05ClassificationResult(**json.loads(step05_path.read_text(encoding="utf-8")))
    step06 = Step06HierarchyResult(**json.loads(step06_path.read_text(encoding="utf-8")))
    step07 = Step07ParagraphResult(**json.loads(step07_path.read_text(encoding="utf-8")))
    step08 = Step08ImageTableResult(**json.loads(step08_path.read_text(encoding="utf-8")))

    result = validate_pipeline(step01, step02, step03, step04, step05, step06, step07, step08)
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result