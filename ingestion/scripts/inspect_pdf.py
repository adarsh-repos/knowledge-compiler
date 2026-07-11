#!/usr/bin/env python3
"""
Inspect NCERT PDF extraction output — run individual pipeline steps and print samples.

Usage:
    python -m ingestion.scripts.inspect_pdf <book_id>
    python -m ingestion.scripts.inspect_pdf <book_id> --step 2 --page 5
    python -m ingestion.scripts.inspect_pdf <book_id> --step 7 --page 8
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import backend.env  # noqa: F401
from backend.pipeline.step01_pdf_reader import run_step01
from backend.pipeline.step02_layout_extractor import run_step02
from backend.pipeline.step07_paragraph_builder import run_step07
from backend.services.store import store


def _book_paths(book_id: str) -> tuple[Path, Path]:
    book = store.get_book(book_id)
    if not book:
        raise SystemExit(f"Book not found: {book_id}")
    pdf = store.book_upload_path(book_id, book.filename)
    if not pdf.exists():
        raise SystemExit(f"PDF not found: {pdf}")
    return pdf, store.pipeline_dir(book_id)


def cmd_step1(book_id: str) -> None:
    pdf, out_dir = _book_paths(book_id)
    out = out_dir / "step01_pdf_reader.json"
    result = run_step01(pdf, out)
    print(f"\n{'='*60}")
    print("STEP 1 — PDF Reader")
    print(f"{'='*60}")
    print(f"PDF:          {result.source}")
    print(f"Total pages:  {result.total_pages}")
    print(f"Validation:   {result.validation.model_dump()}")
    print("\nFirst 5 pages:")
    for p in result.pages[:5]:
        print(f"  Page {p.page}: {p.width}×{p.height} pt, rotation={p.rotation}°")
    print(f"\nFull JSON → {out}")


def cmd_step2(book_id: str, page: int | None) -> None:
    pdf, out_dir = _book_paths(book_id)
    out = out_dir / "step02_layout_extraction.json"
    result = run_step02(pdf, out)
    print(f"\n{'='*60}")
    print("STEP 2 — Layout Extraction")
    print(f"{'='*60}")
    print(f"Total blocks: {result.total_blocks}")
    print(f"Block counts: {json.dumps(result.block_counts, indent=2)}")
    print(f"Validation:   {result.validation.model_dump()}")

    target_page = page or 5
    page_layout = next((p for p in result.pages if p.page == target_page), None)
    if not page_layout:
        print(f"\nNo layout data for page {target_page}")
        return

    print(f"\nPage {target_page} — {len(page_layout.blocks)} blocks (first 6):")
    for b in page_layout.blocks[:6]:
        text = (b.text or "").replace("\n", " ")[:90]
        print(f"  [{b.reading_position:02d}] {b.type:12} @ ({b.coordinates.x0:.0f},{b.coordinates.y0:.0f})")
        if text:
            print(f"       \"{text}{'…' if len(text) >= 90 else ''}\"")
    print(f"\nFull JSON → {out}")
    print(f"API:  GET /api/books/{book_id}/pipeline/step2/pages/{target_page}")


def cmd_step7(book_id: str, page: int | None) -> None:
    _, out_dir = _book_paths(book_id)
    step05 = out_dir / "step05_block_classification.json"
    if not step05.exists():
        raise SystemExit("Run pipeline through step 5 first (or use run_pipeline.py)")

    out = out_dir / "step07_paragraphs.json"
    result = run_step07(step05, out)
    print(f"\n{'='*60}")
    print("STEP 7 — Paragraph Builder")
    print(f"{'='*60}")
    print(f"Total paragraphs: {result.total_paragraphs}")
    print(f"Validation:       {result.validation.model_dump()}")

    target_page = page or 8
    paras = [p for p in result.paragraphs if p.page == target_page][:4]
    print(f"\nPage {target_page} — sample paragraphs:")
    for p in paras:
        text = p.text.replace("\n", " ")[:120]
        print(f"  [{p.paragraph_id}] page={p.page}")
        print(f"    {text}{'…' if len(p.text) > 120 else ''}")
    print(f"\nFull JSON → {out}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect PDF pipeline extraction output")
    parser.add_argument("book_id", help="Book UUID (see data/books.json)")
    parser.add_argument("--step", type=int, default=1, choices=[1, 2, 7], help="Pipeline step to run/show")
    parser.add_argument("--page", type=int, default=None, help="Page number for step 2 or 7 samples")
    args = parser.parse_args()

    if args.step == 1:
        cmd_step1(args.book_id)
    elif args.step == 2:
        cmd_step2(args.book_id, args.page)
    else:
        cmd_step7(args.book_id, args.page)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
