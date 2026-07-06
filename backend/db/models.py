"""
ORM models for the canonical content store.

Hierarchy: Book → Chapter → Section (topic) → Subsection (subtopic) → content entities.
All stable IDs from step10_canonical.json are used as primary keys.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db.base import Base

# JSONB on PostgreSQL; falls back if needed via generic JSON in migration
JsonColumn = JSONB


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class BookRow(Base):
    __tablename__ = "books"

    book_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    subject: Mapped[str] = mapped_column(String(128), nullable=False)
    class_level: Mapped[str] = mapped_column(String(32), nullable=False)
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    total_pages: Mapped[int] = mapped_column(Integer, nullable=False)
    counts: Mapped[Optional[Dict[str, Any]]] = mapped_column(JsonColumn, nullable=True)
    validation_passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    validation_errors: Mapped[Optional[List[str]]] = mapped_column(JsonColumn, nullable=True)
    loaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    source_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )

    chapters: Mapped[List[ChapterRow]] = relationship(back_populates="book", cascade="all, delete-orphan")
    sections: Mapped[List[SectionRow]] = relationship(back_populates="book", cascade="all, delete-orphan")
    subsections: Mapped[List[SubsectionRow]] = relationship(back_populates="book", cascade="all, delete-orphan")
    blocks: Mapped[List[BlockRow]] = relationship(back_populates="book", cascade="all, delete-orphan")
    paragraphs: Mapped[List[ParagraphRow]] = relationship(back_populates="book", cascade="all, delete-orphan")
    figures: Mapped[List[FigureRow]] = relationship(back_populates="book", cascade="all, delete-orphan")
    activities: Mapped[List[ActivityRow]] = relationship(back_populates="book", cascade="all, delete-orphan")
    tables: Mapped[List[TableRow]] = relationship(back_populates="book", cascade="all, delete-orphan")
    glossary_entries: Mapped[List[GlossaryEntryRow]] = relationship(
        back_populates="book", cascade="all, delete-orphan"
    )


class ChapterRow(Base):
    __tablename__ = "chapters"

    chapter_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    roman: Mapped[str] = mapped_column(String(16), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    printed_start: Mapped[int] = mapped_column(Integer, nullable=False)
    printed_end: Mapped[int] = mapped_column(Integer, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    book: Mapped[BookRow] = relationship(back_populates="chapters")
    sections: Mapped[List[SectionRow]] = relationship(back_populates="chapter", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_chapters_book", "book_id"),
        UniqueConstraint("book_id", "number", name="uq_chapters_book_number"),
    )


class SectionRow(Base):
    """Topic level (canonical section)."""

    __tablename__ = "sections"

    section_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    chapter_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("chapters.chapter_id", ondelete="CASCADE"), nullable=False
    )
    number: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    is_overview: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    book: Mapped[BookRow] = relationship(back_populates="sections")
    chapter: Mapped[ChapterRow] = relationship(back_populates="sections")
    subsections: Mapped[List[SubsectionRow]] = relationship(
        back_populates="section", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_sections_book_chapter", "book_id", "chapter_id"),
    )


class SubsectionRow(Base):
    """Subtopic level (canonical subsection)."""

    __tablename__ = "subsections"

    subsection_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    chapter_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("chapters.chapter_id", ondelete="CASCADE"), nullable=False
    )
    section_id: Mapped[str] = mapped_column(
        String(128), ForeignKey("sections.section_id", ondelete="CASCADE"), nullable=False
    )
    number: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    book: Mapped[BookRow] = relationship(back_populates="subsections")
    section: Mapped[SectionRow] = relationship(back_populates="subsections")

    __table_args__ = (
        Index("ix_subsections_book_section", "book_id", "section_id"),
    )


class BlockRow(Base):
    __tablename__ = "blocks"

    block_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    section_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    subsection_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    chapter_roman: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    chapter_title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    topic_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    topic_title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    subsection_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    subsection_title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    placement_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    role: Mapped[str] = mapped_column(String(64), nullable=False)
    content_type: Mapped[str] = mapped_column(String(64), nullable=False)
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    reading_order: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    font: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    font_size: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    bold: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    italic: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    coordinates: Mapped[Optional[Dict[str, Any]]] = mapped_column(JsonColumn, nullable=True)

    book: Mapped[BookRow] = relationship(back_populates="blocks")

    __table_args__ = (
        Index("ix_blocks_book_chapter", "book_id", "chapter_id"),
        Index("ix_blocks_book_section", "book_id", "section_id"),
        Index("ix_blocks_book_role", "book_id", "role"),
        Index("ix_blocks_book_page", "book_id", "page"),
    )


class ParagraphRow(Base):
    __tablename__ = "paragraphs"

    paragraph_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    section_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    subsection_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    source_block_ids: Mapped[Optional[List[str]]] = mapped_column(JsonColumn, nullable=True)

    book: Mapped[BookRow] = relationship(back_populates="paragraphs")

    __table_args__ = (
        Index("ix_paragraphs_book_chapter", "book_id", "chapter_id"),
        Index("ix_paragraphs_book_section", "book_id", "section_id"),
        Index("ix_paragraphs_book_subsection", "book_id", "subsection_id"),
    )


class FigureRow(Base):
    __tablename__ = "figures"

    figure_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    section_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    subsection_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    image_id: Mapped[str] = mapped_column(String(32), nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    block_id: Mapped[str] = mapped_column(String(32), nullable=False)

    book: Mapped[BookRow] = relationship(back_populates="figures")

    __table_args__ = (
        Index("ix_figures_book_chapter", "book_id", "chapter_id"),
    )


class ActivityRow(Base):
    __tablename__ = "activities"

    activity_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    section_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    subsection_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    activity_type: Mapped[str] = mapped_column(String(64), default="activity", nullable=False)
    source_block_ids: Mapped[Optional[List[str]]] = mapped_column(JsonColumn, nullable=True)
    block_id: Mapped[str] = mapped_column(String(32), nullable=False)

    book: Mapped[BookRow] = relationship(back_populates="activities")

    __table_args__ = (
        Index("ix_activities_book_chapter", "book_id", "chapter_id"),
    )


class TableRow(Base):
    __tablename__ = "tables"

    table_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    section_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    subsection_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    rows: Mapped[int] = mapped_column(Integer, nullable=False)
    columns: Mapped[int] = mapped_column(Integer, nullable=False)
    block_id: Mapped[str] = mapped_column(String(32), nullable=False)

    book: Mapped[BookRow] = relationship(back_populates="tables")
    cells: Mapped[List[TableCellRow]] = relationship(back_populates="table", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_tables_book_chapter", "book_id", "chapter_id"),
    )


class TableCellRow(Base):
    __tablename__ = "table_cells"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    table_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("tables.table_id", ondelete="CASCADE"), nullable=False
    )
    row: Mapped[int] = mapped_column(Integer, nullable=False)
    col: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    table: Mapped[TableRow] = relationship(back_populates="cells")

    __table_args__ = (
        UniqueConstraint("table_id", "row", "col", name="uq_table_cells_position"),
        Index("ix_table_cells_table", "table_id"),
    )


class GlossaryEntryRow(Base):
    __tablename__ = "glossary_entries"

    entry_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    glossary_id: Mapped[str] = mapped_column(String(32), nullable=False)
    book_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False
    )
    chapter_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    section_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    subsection_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    page: Mapped[int] = mapped_column(Integer, nullable=False)
    word: Mapped[str] = mapped_column(Text, nullable=False)
    meaning: Mapped[str] = mapped_column(Text, nullable=False)
    block_id: Mapped[str] = mapped_column(String(32), nullable=False)

    book: Mapped[BookRow] = relationship(back_populates="glossary_entries")

    __table_args__ = (
        Index("ix_glossary_book_chapter", "book_id", "chapter_id"),
        Index("ix_glossary_book_word", "book_id", "word"),
    )
