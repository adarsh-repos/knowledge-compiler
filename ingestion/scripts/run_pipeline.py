#!/usr/bin/env python3
"""
Run the full NCERT extraction pipeline (steps 1–10) for a book_id.

Usage:
    python -m ingestion.scripts.run_pipeline <book_id>
    python -m ingestion.scripts.run_pipeline <book_id> --from 3
"""

from __future__ import annotations

import argparse
import sys

import backend.env  # noqa: F401
from backend.pipeline.step01_pdf_reader import run_step01
from backend.pipeline.step02_layout_extractor import run_step02
from backend.pipeline.step03_content_block_builder import run_step03
from backend.pipeline.step04_reading_order_builder import run_step04
from backend.pipeline.step05_block_classifier import run_step05
from backend.pipeline.step06_hierarchy_builder import run_step06
from backend.pipeline.step07_paragraph_builder import run_step07
from backend.pipeline.step08_image_table_builder import run_step08
from backend.pipeline.step09_validation_engine import run_step09
from backend.pipeline.step10_canonical_json import run_step10
from backend.services.store import store


def run_pipeline(book_id: str, from_step: int = 1) -> None:
    book = store.get_book(book_id)
    if not book:
        raise SystemExit(f"Book not found: {book_id}")

    pdf_path = store.book_upload_path(book_id, book.filename)
    if not pdf_path.exists():
        raise SystemExit(f"PDF not found: {pdf_path}")

    runners = {
        1: lambda: run_step01(pdf_path, store.step01_output_path(book_id)),
        2: lambda: run_step02(pdf_path, store.step02_output_path(book_id)),
        3: lambda: run_step03(store.step02_output_path(book_id), store.step03_output_path(book_id)),
        4: lambda: run_step04(store.step03_output_path(book_id), store.step04_output_path(book_id)),
        5: lambda: run_step05(
            store.step04_output_path(book_id),
            store.step02_output_path(book_id),
            store.step05_output_path(book_id),
        ),
        6: lambda: run_step06(
            store.step05_output_path(book_id),
            pdf_path,
            store.step06_output_path(book_id),
            book_title=book.title,
        ),
        7: lambda: run_step07(store.step05_output_path(book_id), store.step07_output_path(book_id)),
        8: lambda: run_step08(
            store.step05_output_path(book_id),
            pdf_path,
            store.step08_output_path(book_id),
            store.step08_images_dir(book_id),
        ),
        9: lambda: run_step09(
            store.step01_output_path(book_id),
            store.step02_output_path(book_id),
            store.step03_output_path(book_id),
            store.step04_output_path(book_id),
            store.step05_output_path(book_id),
            store.step06_output_path(book_id),
            store.step07_output_path(book_id),
            store.step08_output_path(book_id),
            store.step09_output_path(book_id),
        ),
        10: lambda: run_step10(
            book_id=book.id,
            book_title=book.title,
            subject=book.subject,
            class_level=book.class_level,
            filename=book.filename,
            step01_path=store.step01_output_path(book_id),
            step05_path=store.step05_output_path(book_id),
            step06_path=store.step06_output_path(book_id),
            step07_path=store.step07_output_path(book_id),
            step08_path=store.step08_output_path(book_id),
            step09_path=store.step09_output_path(book_id),
            output_path=store.step10_output_path(book_id),
        ),
    }

    for step in range(from_step, 11):
        print(f"Step {step}…", flush=True)
        runners[step]()
        print("  done", flush=True)

    print(f"Pipeline complete → pipeline_output/{book_id}/")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run NCERT PDF pipeline steps 1–10")
    parser.add_argument("book_id", help="Book UUID from data/books.json")
    parser.add_argument("--from", dest="from_step", type=int, default=1, metavar="N")
    args = parser.parse_args()
    run_pipeline(args.book_id, args.from_step)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
