"""
Load step10_canonical.json into PostgreSQL.

Idempotent per book: deletes existing book row (cascade) and reloads.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from backend.db.models import (
    ActivityRow,
    BlockRow,
    BookRow,
    ChapterRow,
    FigureRow,
    GlossaryEntryRow,
    ParagraphRow,
    SectionRow,
    SubsectionRow,
    TableCellRow,
    TableRow,
)
from backend.pipeline.models import Step10CanonicalResult


@dataclass
class LoadResult:
    book_id: str
    loaded: bool
    counts: dict[str, int]
    validation_passed: bool
    errors: list[str]
    source_path: str


def _coords_dict(coords) -> dict | None:
    if coords is None:
        return None
    return coords.model_dump()


def load_canonical_from_path(session: Session, path: Path) -> LoadResult:
    data = json.loads(path.read_text(encoding="utf-8"))
    canonical = Step10CanonicalResult.model_validate(data)
    return load_canonical(session, canonical, source_path=str(path))


def load_canonical(
    session: Session,
    canonical: Step10CanonicalResult,
    *,
    source_path: str | None = None,
) -> LoadResult:
    book_id = canonical.book.book_id
    errors: list[str] = []

    existing = session.get(BookRow, book_id)
    if existing:
        session.delete(existing)
        session.flush()

    now = datetime.now(timezone.utc)
    book = BookRow(
        book_id=book_id,
        title=canonical.book.title,
        subject=canonical.book.subject,
        class_level=canonical.book.class_level,
        filename=canonical.book.filename,
        total_pages=canonical.book.total_pages,
        counts=canonical.counts,
        validation_passed=canonical.validation.structure_complete,
        validation_errors=canonical.validation.errors,
        loaded_at=now,
        source_path=source_path,
        created_at=now,
        updated_at=now,
    )
    session.add(book)

    for idx, ch in enumerate(canonical.chapters):
        session.add(
            ChapterRow(
                chapter_id=ch.chapter_id,
                book_id=book_id,
                number=ch.number,
                roman=ch.roman,
                title=ch.title,
                printed_start=ch.printed_start,
                printed_end=ch.printed_end,
                sort_order=idx,
            )
        )

    section_sort: dict[str, int] = {}
    for ch in canonical.chapters:
        for i, sid in enumerate(ch.section_ids):
            section_sort[sid] = i

    for sec in canonical.sections:
        session.add(
            SectionRow(
                section_id=sec.section_id,
                book_id=book_id,
                chapter_id=sec.chapter_id,
                number=sec.number,
                title=sec.title,
                is_overview=sec.is_overview,
                sort_order=section_sort.get(sec.section_id, 0),
            )
        )

    subsection_sort: dict[str, int] = {}
    for sec in canonical.sections:
        for i, sub_id in enumerate(sec.subsection_ids):
            subsection_sort[sub_id] = i

    for sub in canonical.subsections:
        session.add(
            SubsectionRow(
                subsection_id=sub.subsection_id,
                book_id=book_id,
                chapter_id=sub.chapter_id,
                section_id=sub.section_id,
                number=sub.number,
                title=sub.title,
                sort_order=subsection_sort.get(sub.subsection_id, 0),
            )
        )

    for blk in canonical.blocks:
        session.add(
            BlockRow(
                block_id=blk.block_id,
                book_id=book_id,
                chapter_id=blk.chapter_id,
                section_id=blk.section_id,
                subsection_id=blk.subsection_id,
                chapter_roman=blk.chapter_roman,
                chapter_title=blk.chapter_title,
                topic_number=blk.topic_number,
                topic_title=blk.topic_title,
                subsection_number=blk.subsection_number,
                subsection_title=blk.subsection_title,
                placement_path=blk.placement_path,
                role=blk.role,
                content_type=blk.content_type,
                page=blk.page,
                reading_order=blk.reading_order,
                text=blk.text,
                font=blk.font,
                font_size=blk.font_size,
                bold=blk.bold,
                italic=blk.italic,
                coordinates=_coords_dict(blk.coordinates),
            )
        )

    for para in canonical.paragraphs:
        session.add(
            ParagraphRow(
                paragraph_id=para.paragraph_id,
                book_id=book_id,
                chapter_id=para.chapter_id,
                section_id=para.section_id,
                subsection_id=para.subsection_id,
                order=para.order,
                text=para.text,
                page=para.page,
                source_block_ids=para.source_block_ids,
            )
        )

    for fig in canonical.figures:
        session.add(
            FigureRow(
                figure_id=fig.figure_id,
                book_id=book_id,
                chapter_id=fig.chapter_id,
                section_id=fig.section_id,
                subsection_id=fig.subsection_id,
                page=fig.page,
                image_id=fig.image_id,
                caption=fig.caption,
                block_id=fig.block_id,
            )
        )

    for act in canonical.activities:
        session.add(
            ActivityRow(
                activity_id=act.activity_id,
                book_id=book_id,
                chapter_id=act.chapter_id,
                section_id=act.section_id,
                subsection_id=act.subsection_id,
                page=act.page,
                title=act.title,
                body=act.body,
                activity_type=act.activity_type,
                source_block_ids=act.source_block_ids,
                block_id=act.block_id,
            )
        )

    for tbl in canonical.tables:
        session.add(
            TableRow(
                table_id=tbl.table_id,
                book_id=book_id,
                chapter_id=tbl.chapter_id,
                section_id=tbl.section_id,
                subsection_id=tbl.subsection_id,
                page=tbl.page,
                rows=tbl.rows,
                columns=tbl.columns,
                block_id=tbl.block_id,
            )
        )
        for cell in tbl.cells:
            session.add(
                TableCellRow(
                    table_id=tbl.table_id,
                    row=cell.row,
                    col=cell.col,
                    text=cell.text,
                )
            )

    for i, entry in enumerate(canonical.glossary):
        entry_id = hashlib.sha256(
            f"{book_id}:{entry.glossary_id}:{entry.word}:{i}".encode()
        ).hexdigest()[:32]
        entry_id = f"GE{entry_id}"
        session.add(
            GlossaryEntryRow(
                entry_id=entry_id,
                glossary_id=entry.glossary_id,
                book_id=book_id,
                chapter_id=entry.chapter_id,
                section_id=entry.section_id,
                subsection_id=entry.subsection_id,
                page=entry.page,
                word=entry.word,
                meaning=entry.meaning,
                block_id=entry.block_id,
            )
        )

    session.commit()

    return LoadResult(
        book_id=book_id,
        loaded=True,
        counts=canonical.counts,
        validation_passed=canonical.validation.structure_complete,
        errors=errors + canonical.validation.errors,
        source_path=source_path or "",
    )
