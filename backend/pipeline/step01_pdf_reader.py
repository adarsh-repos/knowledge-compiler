"""
STEP 1 — PDF Reader
===================
Read every page without losing layout metadata.

Extracts per page: page number, width, height, rotation.
Validates: every page detected, total count matches PDF.
"""

from __future__ import annotations

from pathlib import Path

import fitz  # pymupdf

from backend.pipeline.models import PdfPageInfo, Step01PdfReaderResult, StepValidation


def read_pdf(pdf_path: Path) -> Step01PdfReaderResult:
    """Read all pages from a PDF and return structured metadata."""
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    if pdf_path.suffix.lower() != ".pdf":
        raise ValueError(f"Not a PDF file: {pdf_path}")

    doc = fitz.open(pdf_path)
    try:
        expected_count = doc.page_count
        pages: list[PdfPageInfo] = []

        for index in range(expected_count):
            page = doc.load_page(index)
            rect = page.rect
            pages.append(
                PdfPageInfo(
                    page=index + 1,
                    width=round(rect.width, 2),
                    height=round(rect.height, 2),
                    rotation=page.rotation,
                )
            )

        validation = _validate_pages(pages, expected_count)
        return Step01PdfReaderResult(
            source=str(pdf_path.resolve()),
            total_pages=expected_count,
            pages=pages,
            validation=validation,
        )
    finally:
        doc.close()


def _validate_pages(pages: list[PdfPageInfo], expected_count: int) -> StepValidation:
    errors: list[str] = []

    if len(pages) != expected_count:
        errors.append(
            f"Page count mismatch: extracted {len(pages)}, PDF reports {expected_count}"
        )

    expected_numbers = set(range(1, expected_count + 1))
    found_numbers = {p.page for p in pages}
    missing = sorted(expected_numbers - found_numbers)
    if missing:
        errors.append(f"Missing page numbers: {missing}")

    duplicates = sorted({p.page for p in pages if sum(1 for x in pages if x.page == p.page) > 1})
    if duplicates:
        errors.append(f"Duplicate page numbers: {duplicates}")

    for p in pages:
        if p.width <= 0 or p.height <= 0:
            errors.append(f"Page {p.page}: invalid dimensions {p.width}x{p.height}")
        if p.rotation not in (0, 90, 180, 270):
            errors.append(f"Page {p.page}: unexpected rotation {p.rotation}")

    every_page_detected = not missing and not duplicates and len(pages) == expected_count
    page_count_matches = len(pages) == expected_count

    return StepValidation(
        every_page_detected=every_page_detected,
        page_count_matches=page_count_matches,
        errors=errors,
    )


def run_step01(pdf_path: Path, output_path: Path | None = None) -> Step01PdfReaderResult:
    """Run Step 1 and optionally persist JSON output."""
    result = read_pdf(pdf_path)
    if output_path is not None:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            result.model_dump_json(indent=2),
            encoding="utf-8",
        )
    return result
