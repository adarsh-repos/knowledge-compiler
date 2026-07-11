#!/usr/bin/env python3
"""
Load step10_canonical.json into PostgreSQL.

Usage:
    python -m ingestion.scripts.load_canonical <book_id>
"""

from __future__ import annotations

import argparse

import backend.env  # noqa: F401
from backend.db.load_canonical import load_book


def main() -> int:
    parser = argparse.ArgumentParser(description="Load canonical JSON into PostgreSQL")
    parser.add_argument("book_id", help="Book UUID")
    args = parser.parse_args()
    load_book(args.book_id)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
