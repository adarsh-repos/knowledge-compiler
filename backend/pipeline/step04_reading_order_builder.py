"""
STEP 4 — Reading Order Builder
==============================
Assign global reading_order to every content block (no AI).

Sort: page ascending → top-to-bottom (y0) → left-to-right (x0).
"""

from __future__ import annotations

import json
from pathlib import Path

from backend.pipeline.models import (
    ContentBlock,
    OrderedContentBlock,
    Step03ContentBlockResult,
    Step04ReadingOrderResult,
    Step04Validation,
)


def _sort_key(block: ContentBlock) -> tuple:
    if block.coordinates:
        return (block.page, block.coordinates.y0, block.coordinates.x0, block.reading_position)
    return (block.page, block.reading_position, 0, 0)


def build_reading_order(step03: Step03ContentBlockResult) -> Step04ReadingOrderResult:
    sorted_blocks = sorted(step03.blocks, key=_sort_key)

    ordered: list[OrderedContentBlock] = []
    page_counters: dict[int, int] = {}

    for global_order, block in enumerate(sorted_blocks, start=1):
        page_counters[block.page] = page_counters.get(block.page, 0) + 1
        ordered.append(
            OrderedContentBlock(
                **block.model_dump(),
                reading_order=global_order,
                page_reading_order=page_counters[block.page],
            )
        )

    validation = _validate(ordered, step03)
    return Step04ReadingOrderResult(
        source=step03.source,
        total_pages=step03.total_pages,
        total_blocks=len(ordered),
        blocks=ordered,
        validation=validation,
    )


def _validate(
    ordered: list[OrderedContentBlock],
    step03: Step03ContentBlockResult,
) -> Step04Validation:
    errors: list[str] = []

    expected_count = len(step03.blocks)
    if len(ordered) != expected_count:
        errors.append(
            f"Block count mismatch: {len(ordered)} ordered vs {expected_count} from Step 3"
        )

    orders = [b.reading_order for b in ordered]
    expected_orders = list(range(1, len(ordered) + 1))
    if orders != expected_orders:
        errors.append("reading_order is not sequential 1..N")

    step3_ids = {b.block_id for b in step03.blocks}
    ordered_ids = {b.block_id for b in ordered}
    missing = step3_ids - ordered_ids
    extra = ordered_ids - step3_ids
    if missing:
        errors.append(f"Skipped blocks: {sorted(missing)[:5]}")
    if extra:
        errors.append(f"Unexpected blocks: {sorted(extra)[:5]}")

    sequence_ok = True
    for i in range(1, len(ordered)):
        prev, curr = ordered[i - 1], ordered[i]
        if curr.page < prev.page:
            sequence_ok = False
            errors.append(
                f"Page order broken at reading_order {curr.reading_order}: "
                f"page {curr.page} after page {prev.page}"
            )
            break
        if curr.page == prev.page and prev.coordinates and curr.coordinates:
            if curr.coordinates.y0 < prev.coordinates.y0 - 2:
                sequence_ok = False
                errors.append(
                    f"Vertical order broken on page {curr.page} at reading_order {curr.reading_order}"
                )
                break

    for page_num in sorted(page_counters := _page_counts(ordered)):
        page_orders = [
            b.page_reading_order for b in ordered if b.page == page_num
        ]
        if page_orders != list(range(1, len(page_orders) + 1)):
            errors.append(f"Page {page_num}: page_reading_order not sequential")
            sequence_ok = False
            break

    no_skipped = not missing and not extra and len(ordered) == expected_count

    return Step04Validation(
        reading_sequence_correct=sequence_ok and orders == expected_orders,
        no_skipped_blocks=no_skipped,
        errors=errors,
    )


def _page_counts(blocks: list[OrderedContentBlock]) -> dict[int, int]:
    counts: dict[int, int] = {}
    for b in blocks:
        counts[b.page] = counts.get(b.page, 0) + 1
    return counts


def build_from_step03_path(step03_path: Path) -> Step04ReadingOrderResult:
    data = json.loads(step03_path.read_text(encoding="utf-8"))
    step03 = Step03ContentBlockResult(**data)
    return build_reading_order(step03)


def run_step04(step03_path: Path, output_path: Path | None = None) -> Step04ReadingOrderResult:
    result = build_from_step03_path(step03_path)
    if output_path is not None:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result
