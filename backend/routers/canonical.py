"""
Canonical Content Store API — System 2.

Load step10 JSON into PostgreSQL and query by hierarchy.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.db.loader import load_canonical_from_path
from backend.db.repository import (
    CanonicalRepository,
    block_to_dict,
    book_to_dict,
)
from backend.db.session import get_db
from backend.services.store import store

router = APIRouter(prefix="/api", tags=["canonical"])


def _repo(session: Session = Depends(get_db)) -> CanonicalRepository:
    return CanonicalRepository(session)


@router.post("/books/{book_id}/canonical/load")
def load_book_canonical(book_id: str, session: Session = Depends(get_db)):
    """Load step10_canonical.json for a book into PostgreSQL (replace if exists)."""
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")

    path = store.step10_output_path(book_id)
    if not path.exists():
        raise HTTPException(
            400,
            detail={
                "message": "step10_canonical.json not found — run pipeline step 10 first",
                "path": str(path),
            },
        )

    try:
        result = load_canonical_from_path(session, path)
    except Exception as exc:
        session.rollback()
        raise HTTPException(500, detail=f"Canonical load failed: {exc}") from exc

    return {
        "message": "Canonical content loaded into PostgreSQL",
        "book_id": result.book_id,
        "counts": result.counts,
        "validation_passed": result.validation_passed,
        "source_path": result.source_path,
    }


@router.get("/books/{book_id}/canonical/status")
def canonical_status(book_id: str, repo: CanonicalRepository = Depends(_repo)):
    row = repo.get_book(book_id)
    if not row:
        return {"book_id": book_id, "loaded": False}
    return {"loaded": True, **book_to_dict(row)}


@router.get("/books/{book_id}/canonical/chapters")
def list_canonical_chapters(book_id: str, repo: CanonicalRepository = Depends(_repo)):
    if not repo.book_loaded(book_id):
        raise HTTPException(404, "Book not loaded in canonical store — POST /canonical/load first")
    chapters = repo.list_chapters(book_id)
    return [
        {
            "chapter_id": c.chapter_id,
            "number": c.number,
            "roman": c.roman,
            "title": c.title,
            "printed_start": c.printed_start,
            "printed_end": c.printed_end,
        }
        for c in chapters
    ]


@router.get("/books/{book_id}/canonical/chapters/{chapter_id}/tree")
def get_chapter_tree(
    book_id: str,
    chapter_id: str,
    repo: CanonicalRepository = Depends(_repo),
):
    if not repo.book_loaded(book_id):
        raise HTTPException(404, "Book not loaded in canonical store")
    tree = repo.get_chapter_tree(book_id, chapter_id)
    if not tree:
        raise HTTPException(404, f"Chapter {chapter_id} not found")
    return tree


@router.get("/books/{book_id}/canonical/content")
def get_topic_content(
    book_id: str,
    chapter_id: Optional[str] = Query(None),
    section_id: Optional[str] = Query(None, description="Topic ID (section_id)"),
    subsection_id: Optional[str] = Query(None, description="Subtopic ID"),
    limit: int = Query(500, ge=1, le=2000),
    repo: CanonicalRepository = Depends(_repo),
):
    """
    Fetch paragraphs, figures, activities, tables, glossary for a scope.

    Scope narrowest wins: subsection_id > section_id > chapter_id > whole book.
    """
    if not repo.book_loaded(book_id):
        raise HTTPException(404, "Book not loaded in canonical store")
    return repo.get_topic_content(
        book_id,
        chapter_id=chapter_id,
        section_id=section_id,
        subsection_id=subsection_id,
        limit=limit,
    )


@router.get("/books/{book_id}/canonical/blocks")
def list_blocks(
    book_id: str,
    chapter_id: Optional[str] = Query(None),
    section_id: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    page: Optional[int] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    repo: CanonicalRepository = Depends(_repo),
):
    if not repo.book_loaded(book_id):
        raise HTTPException(404, "Book not loaded in canonical store")
    rows, total = repo.list_blocks(
        book_id,
        chapter_id=chapter_id,
        section_id=section_id,
        role=role,
        page=page,
        offset=offset,
        limit=limit,
    )
    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "blocks": [block_to_dict(r) for r in rows],
    }


@router.get("/books/{book_id}/canonical/search")
def search_content(
    book_id: str,
    q: str = Query(..., min_length=2),
    chapter_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    repo: CanonicalRepository = Depends(_repo),
):
    if not repo.book_loaded(book_id):
        raise HTTPException(404, "Book not loaded in canonical store")
    paragraphs = repo.search_paragraphs(book_id, q, chapter_id=chapter_id, limit=limit)
    from backend.db.repository import _paragraph_dict

    return {"query": q, "paragraphs": [_paragraph_dict(p) for p in paragraphs]}
