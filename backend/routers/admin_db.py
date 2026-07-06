"""Database inspection endpoints (dev / admin)."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.db.config import get_database_url
from backend.db.session import get_db

router = APIRouter(prefix="/api/admin/db", tags=["database"])


@router.get("/health")
def db_health(session: Session = Depends(get_db)):
    """Check PostgreSQL connectivity."""
    try:
        session.execute(text("SELECT 1"))
        return {"status": "ok", "database_url": get_database_url().split("@")[-1]}
    except Exception as exc:
        raise HTTPException(503, detail=f"Database unavailable: {exc}") from exc


@router.get("/tables")
def list_tables(session: Session = Depends(get_db)):
    """
    List all tables in the canonical store with approximate row counts.

    Use this to verify data after `POST /canonical/load`.
  """
    rows = session.execute(
        text(
            """
            SELECT c.relname AS table_name,
                   COALESCE(s.n_live_tup, 0)::bigint AS row_count
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
            WHERE n.nspname = 'public'
              AND c.relkind = 'r'
            ORDER BY c.relname
            """
        )
    ).fetchall()

    tables = [{"table": r.table_name, "rows": int(r.row_count)} for r in rows]
    total_rows = sum(t["rows"] for t in tables)
    return {
        "schema": "public",
        "table_count": len(tables),
        "total_rows": total_rows,
        "tables": tables,
    }


@router.get("/books")
def list_loaded_books(session: Session = Depends(get_db)):
    """List all books currently in the canonical store."""
    rows = session.execute(
        text(
            """
            SELECT book_id, title, subject, class_level, total_pages,
                   counts, validation_passed, loaded_at
            FROM books
            ORDER BY loaded_at DESC NULLS LAST
            """
        )
    ).fetchall()
    return [
        {
            "book_id": r.book_id,
            "title": r.title,
            "subject": r.subject,
            "class_level": r.class_level,
            "total_pages": r.total_pages,
            "counts": r.counts,
            "validation_passed": r.validation_passed,
            "loaded_at": r.loaded_at.isoformat() if r.loaded_at else None,
        }
        for r in rows
    ]


@router.get("/preview/{table_name}")
def preview_table(
    table_name: str,
    limit: int = 10,
    book_id: Optional[str] = None,
    session: Session = Depends(get_db),
):
    """
  Preview rows from a canonical table (first N rows).

  Allowed tables: books, chapters, sections, subsections, blocks, paragraphs,
  figures, activities, tables, table_cells, glossary_entries
  """
    allowed = {
        "books",
        "chapters",
        "sections",
        "subsections",
        "blocks",
        "paragraphs",
        "figures",
        "activities",
        "tables",
        "table_cells",
        "glossary_entries",
    }
    if table_name not in allowed:
        raise HTTPException(400, detail=f"Table not allowed. Choose from: {sorted(allowed)}")

    limit = min(max(limit, 1), 50)
    if book_id and table_name != "books":
        sql = text(f"SELECT * FROM {table_name} WHERE book_id = :book_id LIMIT :limit")
        rows = session.execute(sql, {"book_id": book_id, "limit": limit}).mappings().all()
    else:
        sql = text(f"SELECT * FROM {table_name} LIMIT :limit")
        rows = session.execute(sql, {"limit": limit}).mappings().all()

    return {
        "table": table_name,
        "limit": limit,
        "book_id": book_id,
        "rows": [dict(r) for r in rows],
    }
