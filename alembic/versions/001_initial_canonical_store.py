"""Initial canonical content store schema

Revision ID: 001_initial
Revises:
Create Date: 2026-07-06
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "books",
        sa.Column("book_id", sa.String(64), primary_key=True),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("subject", sa.String(128), nullable=False),
        sa.Column("class_level", sa.String(32), nullable=False),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("total_pages", sa.Integer(), nullable=False),
        sa.Column("counts", postgresql.JSONB(), nullable=True),
        sa.Column("validation_passed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("validation_errors", postgresql.JSONB(), nullable=True),
        sa.Column("loaded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("source_path", sa.String(1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "chapters",
        sa.Column("chapter_id", sa.String(64), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("roman", sa.String(16), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("printed_start", sa.Integer(), nullable=False),
        sa.Column("printed_end", sa.Integer(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.UniqueConstraint("book_id", "number", name="uq_chapters_book_number"),
    )
    op.create_index("ix_chapters_book", "chapters", ["book_id"])
    op.create_table(
        "sections",
        sa.Column("section_id", sa.String(128), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), sa.ForeignKey("chapters.chapter_id", ondelete="CASCADE"), nullable=False),
        sa.Column("number", sa.String(32), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("is_overview", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_sections_book_chapter", "sections", ["book_id", "chapter_id"])
    op.create_table(
        "subsections",
        sa.Column("subsection_id", sa.String(128), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), sa.ForeignKey("chapters.chapter_id", ondelete="CASCADE"), nullable=False),
        sa.Column("section_id", sa.String(128), sa.ForeignKey("sections.section_id", ondelete="CASCADE"), nullable=False),
        sa.Column("number", sa.String(32), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_subsections_book_section", "subsections", ["book_id", "section_id"])
    op.create_table(
        "blocks",
        sa.Column("block_id", sa.String(32), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), nullable=True),
        sa.Column("section_id", sa.String(128), nullable=True),
        sa.Column("subsection_id", sa.String(128), nullable=True),
        sa.Column("chapter_roman", sa.String(16), nullable=True),
        sa.Column("chapter_title", sa.String(512), nullable=True),
        sa.Column("topic_number", sa.String(32), nullable=True),
        sa.Column("topic_title", sa.String(512), nullable=True),
        sa.Column("subsection_number", sa.String(32), nullable=True),
        sa.Column("subsection_title", sa.String(512), nullable=True),
        sa.Column("placement_path", sa.String(1024), nullable=False),
        sa.Column("role", sa.String(64), nullable=False),
        sa.Column("content_type", sa.String(64), nullable=False),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("reading_order", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=True),
        sa.Column("font", sa.String(128), nullable=True),
        sa.Column("font_size", sa.Float(), nullable=True),
        sa.Column("bold", sa.Boolean(), nullable=True),
        sa.Column("italic", sa.Boolean(), nullable=True),
        sa.Column("coordinates", postgresql.JSONB(), nullable=True),
    )
    op.create_index("ix_blocks_book_chapter", "blocks", ["book_id", "chapter_id"])
    op.create_index("ix_blocks_book_section", "blocks", ["book_id", "section_id"])
    op.create_index("ix_blocks_book_role", "blocks", ["book_id", "role"])
    op.create_index("ix_blocks_book_page", "blocks", ["book_id", "page"])
    op.create_table(
        "paragraphs",
        sa.Column("paragraph_id", sa.String(32), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), nullable=True),
        sa.Column("section_id", sa.String(128), nullable=True),
        sa.Column("subsection_id", sa.String(128), nullable=True),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("source_block_ids", postgresql.JSONB(), nullable=True),
    )
    op.create_index("ix_paragraphs_book_chapter", "paragraphs", ["book_id", "chapter_id"])
    op.create_index("ix_paragraphs_book_section", "paragraphs", ["book_id", "section_id"])
    op.create_index("ix_paragraphs_book_subsection", "paragraphs", ["book_id", "subsection_id"])
    op.create_table(
        "figures",
        sa.Column("figure_id", sa.String(32), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), nullable=True),
        sa.Column("section_id", sa.String(128), nullable=True),
        sa.Column("subsection_id", sa.String(128), nullable=True),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("image_id", sa.String(32), nullable=False),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("block_id", sa.String(32), nullable=False),
    )
    op.create_index("ix_figures_book_chapter", "figures", ["book_id", "chapter_id"])
    op.create_table(
        "activities",
        sa.Column("activity_id", sa.String(32), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), nullable=True),
        sa.Column("section_id", sa.String(128), nullable=True),
        sa.Column("subsection_id", sa.String(128), nullable=True),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("activity_type", sa.String(64), nullable=False, server_default="activity"),
        sa.Column("source_block_ids", postgresql.JSONB(), nullable=True),
        sa.Column("block_id", sa.String(32), nullable=False),
    )
    op.create_index("ix_activities_book_chapter", "activities", ["book_id", "chapter_id"])
    op.create_table(
        "tables",
        sa.Column("table_id", sa.String(32), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), nullable=True),
        sa.Column("section_id", sa.String(128), nullable=True),
        sa.Column("subsection_id", sa.String(128), nullable=True),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("rows", sa.Integer(), nullable=False),
        sa.Column("columns", sa.Integer(), nullable=False),
        sa.Column("block_id", sa.String(32), nullable=False),
    )
    op.create_index("ix_tables_book_chapter", "tables", ["book_id", "chapter_id"])
    op.create_table(
        "table_cells",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("table_id", sa.String(32), sa.ForeignKey("tables.table_id", ondelete="CASCADE"), nullable=False),
        sa.Column("row", sa.Integer(), nullable=False),
        sa.Column("col", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.UniqueConstraint("table_id", "row", "col", name="uq_table_cells_position"),
    )
    op.create_index("ix_table_cells_table", "table_cells", ["table_id"])
    op.create_table(
        "glossary_entries",
        sa.Column("entry_id", sa.String(64), primary_key=True),
        sa.Column("glossary_id", sa.String(32), nullable=False),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), nullable=True),
        sa.Column("section_id", sa.String(128), nullable=True),
        sa.Column("subsection_id", sa.String(128), nullable=True),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("word", sa.String(256), nullable=False),
        sa.Column("meaning", sa.Text(), nullable=False),
        sa.Column("block_id", sa.String(32), nullable=False),
    )
    op.create_index("ix_glossary_book_chapter", "glossary_entries", ["book_id", "chapter_id"])
    op.create_index("ix_glossary_book_word", "glossary_entries", ["book_id", "word"])


def downgrade() -> None:
    op.drop_table("glossary_entries")
    op.drop_table("table_cells")
    op.drop_table("tables")
    op.drop_table("activities")
    op.drop_table("figures")
    op.drop_table("paragraphs")
    op.drop_table("blocks")
    op.drop_table("subsections")
    op.drop_table("sections")
    op.drop_table("chapters")
    op.drop_table("books")
