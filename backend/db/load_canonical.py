#!/usr/bin/env python3
"""
CLI: load step10 canonical JSON into PostgreSQL.

Usage:
  python -m backend.db.load_canonical <book_id>
  python -m backend.db.load_canonical --all
  python -m backend.db.load_canonical --init-db
"""

from __future__ import annotations

import argparse
import sys

import backend.env  # noqa: F401
from backend.db.base import Base
from backend.db.loader import load_canonical_from_path
from backend.db.session import get_engine, get_session_factory
from backend.services.store import store

# Import models so metadata is registered
from backend.db import models as _models  # noqa: F401


def init_db() -> None:
    engine = get_engine()
    Base.metadata.create_all(engine)
    print("Database tables created.")


def load_book(book_id: str) -> None:
    path = store.step10_output_path(book_id)
    if not path.exists():
        print(f"Missing {path}", file=sys.stderr)
        sys.exit(1)
    session = get_session_factory()()
    try:
        result = load_canonical_from_path(session, path)
        print(f"Loaded {result.book_id}: {result.counts}")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Canonical content store loader")
    parser.add_argument("book_id", nargs="?", help="Book UUID to load")
    parser.add_argument("--all", action="store_true", help="Load all books with step10 output")
    parser.add_argument("--init-db", action="store_true", help="Create tables")
    args = parser.parse_args()

    if args.init_db:
        init_db()
        if not args.book_id and not args.all:
            return

    if args.all:
        for book in store.list_books():
            path = store.step10_output_path(book.id)
            if path.exists():
                print(f"Loading {book.id} ({book.title})...")
                load_book(book.id)
        return

    if not args.book_id:
        parser.print_help()
        sys.exit(1)

    load_book(args.book_id)


if __name__ == "__main__":
    main()
