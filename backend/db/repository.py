"""
Read API for the canonical content store.
"""

from __future__ import annotations

from sqlalchemy import func, select
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


class CanonicalRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_book(self, book_id: str) -> BookRow | None:
        return self.session.get(BookRow, book_id)

    def book_loaded(self, book_id: str) -> bool:
        return self.get_book(book_id) is not None

    def list_chapters(self, book_id: str) -> list[ChapterRow]:
        stmt = (
            select(ChapterRow)
            .where(ChapterRow.book_id == book_id)
            .order_by(ChapterRow.sort_order, ChapterRow.number)
        )
        return list(self.session.scalars(stmt))

    def get_chapter(self, book_id: str, chapter_id: str) -> ChapterRow | None:
        return self.session.get(ChapterRow, chapter_id)

    def list_sections(self, book_id: str, chapter_id: str) -> list[SectionRow]:
        stmt = (
            select(SectionRow)
            .where(SectionRow.book_id == book_id, SectionRow.chapter_id == chapter_id)
            .order_by(SectionRow.sort_order, SectionRow.number)
        )
        return list(self.session.scalars(stmt))

    def list_subsections(self, book_id: str, section_id: str) -> list[SubsectionRow]:
        stmt = (
            select(SubsectionRow)
            .where(SubsectionRow.book_id == book_id, SubsectionRow.section_id == section_id)
            .order_by(SubsectionRow.sort_order, SubsectionRow.number)
        )
        return list(self.session.scalars(stmt))

    def get_chapter_tree(self, book_id: str, chapter_id: str) -> dict:
        chapter = self.get_chapter(book_id, chapter_id)
        if not chapter:
            return {}

        sections = self.list_sections(book_id, chapter_id)
        tree_sections = []
        for sec in sections:
            subs = self.list_subsections(book_id, sec.section_id)
            tree_sections.append(
                {
                    "section_id": sec.section_id,
                    "number": sec.number,
                    "title": sec.title,
                    "is_overview": sec.is_overview,
                    "subsections": [
                        {
                            "subsection_id": s.subsection_id,
                            "number": s.number,
                            "title": s.title,
                        }
                        for s in subs
                    ],
                }
            )

        return {
            "chapter_id": chapter.chapter_id,
            "number": chapter.number,
            "roman": chapter.roman,
            "title": chapter.title,
            "printed_start": chapter.printed_start,
            "printed_end": chapter.printed_end,
            "sections": tree_sections,
        }

    def get_topic_content(
        self,
        book_id: str,
        *,
        chapter_id: str | None = None,
        section_id: str | None = None,
        subsection_id: str | None = None,
        limit: int = 500,
    ) -> dict:
        """All teachable content for a topic / subtopic scope."""
        return {
            "paragraphs": self._list_paragraphs(
                book_id, chapter_id, section_id, subsection_id, limit
            ),
            "figures": self._list_figures(book_id, chapter_id, section_id, subsection_id, limit),
            "activities": self._list_activities(
                book_id, chapter_id, section_id, subsection_id, limit
            ),
            "tables": self._list_tables(book_id, chapter_id, section_id, subsection_id, limit),
            "glossary": self._list_glossary(book_id, chapter_id, section_id, subsection_id, limit),
        }

    def list_blocks(
        self,
        book_id: str,
        *,
        chapter_id: str | None = None,
        section_id: str | None = None,
        role: str | None = None,
        page: int | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> tuple[list[BlockRow], int]:
        stmt = select(BlockRow).where(BlockRow.book_id == book_id)
        count_stmt = select(func.count()).select_from(BlockRow).where(BlockRow.book_id == book_id)

        if chapter_id:
            stmt = stmt.where(BlockRow.chapter_id == chapter_id)
            count_stmt = count_stmt.where(BlockRow.chapter_id == chapter_id)
        if section_id:
            stmt = stmt.where(BlockRow.section_id == section_id)
            count_stmt = count_stmt.where(BlockRow.section_id == section_id)
        if role:
            stmt = stmt.where(BlockRow.role == role)
            count_stmt = count_stmt.where(BlockRow.role == role)
        if page is not None:
            stmt = stmt.where(BlockRow.page == page)
            count_stmt = count_stmt.where(BlockRow.page == page)

        total = self.session.scalar(count_stmt) or 0
        rows = list(
            self.session.scalars(
                stmt.order_by(BlockRow.reading_order).offset(offset).limit(limit)
            )
        )
        return rows, total

    def search_paragraphs(
        self,
        book_id: str,
        query: str,
        *,
        chapter_id: str | None = None,
        limit: int = 20,
    ) -> list[ParagraphRow]:
        pattern = f"%{query}%"
        stmt = select(ParagraphRow).where(
            ParagraphRow.book_id == book_id,
            ParagraphRow.text.ilike(pattern),
        )
        if chapter_id:
            stmt = stmt.where(ParagraphRow.chapter_id == chapter_id)
        stmt = stmt.order_by(ParagraphRow.order).limit(limit)
        return list(self.session.scalars(stmt))

    def _scope_filter(self, model, book_id, chapter_id, section_id, subsection_id):
        stmt = select(model).where(model.book_id == book_id)
        if subsection_id:
            stmt = stmt.where(model.subsection_id == subsection_id)
        elif section_id:
            stmt = stmt.where(model.section_id == section_id)
        elif chapter_id:
            stmt = stmt.where(model.chapter_id == chapter_id)
        return stmt

    def _list_paragraphs(self, book_id, chapter_id, section_id, subsection_id, limit):
        stmt = self._scope_filter(ParagraphRow, book_id, chapter_id, section_id, subsection_id)
        rows = self.session.scalars(stmt.order_by(ParagraphRow.order).limit(limit))
        return [_paragraph_dict(r) for r in rows]

    def _list_figures(self, book_id, chapter_id, section_id, subsection_id, limit):
        stmt = self._scope_filter(FigureRow, book_id, chapter_id, section_id, subsection_id)
        rows = self.session.scalars(stmt.order_by(FigureRow.page).limit(limit))
        return [_figure_dict(r) for r in rows]

    def _list_activities(self, book_id, chapter_id, section_id, subsection_id, limit):
        stmt = self._scope_filter(ActivityRow, book_id, chapter_id, section_id, subsection_id)
        rows = self.session.scalars(stmt.order_by(ActivityRow.page).limit(limit))
        return [_activity_dict(r) for r in rows]

    def _list_glossary(self, book_id, chapter_id, section_id, subsection_id, limit):
        stmt = self._scope_filter(GlossaryEntryRow, book_id, chapter_id, section_id, subsection_id)
        rows = self.session.scalars(stmt.order_by(GlossaryEntryRow.word).limit(limit))
        return [_glossary_dict(r) for r in rows]

    def _list_tables(self, book_id, chapter_id, section_id, subsection_id, limit):
        stmt = self._scope_filter(TableRow, book_id, chapter_id, section_id, subsection_id)
        tables = list(self.session.scalars(stmt.order_by(TableRow.page).limit(limit)))
        result = []
        for tbl in tables:
            cells = list(
                self.session.scalars(
                    select(TableCellRow)
                    .where(TableCellRow.table_id == tbl.table_id)
                    .order_by(TableCellRow.row, TableCellRow.col)
                )
            )
            result.append({**_table_dict(tbl), "cells": [_cell_dict(c) for c in cells]})
        return result


def _paragraph_dict(r: ParagraphRow) -> dict:
    return {
        "paragraph_id": r.paragraph_id,
        "book_id": r.book_id,
        "chapter_id": r.chapter_id,
        "section_id": r.section_id,
        "subsection_id": r.subsection_id,
        "order": r.order,
        "text": r.text,
        "page": r.page,
        "source_block_ids": r.source_block_ids or [],
    }


def _figure_dict(r: FigureRow) -> dict:
    return {
        "figure_id": r.figure_id,
        "book_id": r.book_id,
        "chapter_id": r.chapter_id,
        "section_id": r.section_id,
        "subsection_id": r.subsection_id,
        "page": r.page,
        "image_id": r.image_id,
        "caption": r.caption,
        "block_id": r.block_id,
    }


def _activity_dict(r: ActivityRow) -> dict:
    return {
        "activity_id": r.activity_id,
        "book_id": r.book_id,
        "chapter_id": r.chapter_id,
        "section_id": r.section_id,
        "subsection_id": r.subsection_id,
        "page": r.page,
        "title": r.title,
        "body": r.body,
        "activity_type": r.activity_type,
        "source_block_ids": r.source_block_ids or [],
        "block_id": r.block_id,
    }


def _glossary_dict(r: GlossaryEntryRow) -> dict:
    return {
        "entry_id": r.entry_id,
        "glossary_id": r.glossary_id,
        "book_id": r.book_id,
        "chapter_id": r.chapter_id,
        "section_id": r.section_id,
        "subsection_id": r.subsection_id,
        "page": r.page,
        "word": r.word,
        "meaning": r.meaning,
        "block_id": r.block_id,
    }


def _table_dict(r: TableRow) -> dict:
    return {
        "table_id": r.table_id,
        "book_id": r.book_id,
        "chapter_id": r.chapter_id,
        "section_id": r.section_id,
        "subsection_id": r.subsection_id,
        "page": r.page,
        "rows": r.rows,
        "columns": r.columns,
        "block_id": r.block_id,
    }


def _cell_dict(r: TableCellRow) -> dict:
    return {"row": r.row, "col": r.col, "text": r.text}


def block_to_dict(r: BlockRow) -> dict:
    return {
        "block_id": r.block_id,
        "book_id": r.book_id,
        "chapter_id": r.chapter_id,
        "section_id": r.section_id,
        "subsection_id": r.subsection_id,
        "placement_path": r.placement_path,
        "role": r.role,
        "content_type": r.content_type,
        "page": r.page,
        "reading_order": r.reading_order,
        "text": r.text,
        "topic_number": r.topic_number,
        "topic_title": r.topic_title,
        "subsection_number": r.subsection_number,
        "subsection_title": r.subsection_title,
    }


def book_to_dict(r: BookRow) -> dict:
    return {
        "book_id": r.book_id,
        "title": r.title,
        "subject": r.subject,
        "class_level": r.class_level,
        "filename": r.filename,
        "total_pages": r.total_pages,
        "counts": r.counts or {},
        "validation_passed": r.validation_passed,
        "loaded_at": r.loaded_at.isoformat() if r.loaded_at else None,
    }
