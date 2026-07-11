"""Data governance and progress schema hardening.

Revision ID: 002_data_governance_progress
Revises: 001_initial
Create Date: 2026-07-07
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002_data_governance_progress"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Stronger referential integrity for canonical content tables.
    op.create_foreign_key(
        "fk_blocks_chapter",
        "blocks",
        "chapters",
        ["chapter_id"],
        ["chapter_id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_blocks_section",
        "blocks",
        "sections",
        ["section_id"],
        ["section_id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_blocks_subsection",
        "blocks",
        "subsections",
        ["subsection_id"],
        ["subsection_id"],
        ondelete="SET NULL",
    )

    op.create_foreign_key(
        "fk_paragraphs_chapter",
        "paragraphs",
        "chapters",
        ["chapter_id"],
        ["chapter_id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_paragraphs_section",
        "paragraphs",
        "sections",
        ["section_id"],
        ["section_id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_paragraphs_subsection",
        "paragraphs",
        "subsections",
        ["subsection_id"],
        ["subsection_id"],
        ondelete="SET NULL",
    )

    for table_name in ["figures", "activities", "tables", "glossary_entries"]:
        op.create_foreign_key(
            f"fk_{table_name}_chapter",
            table_name,
            "chapters",
            ["chapter_id"],
            ["chapter_id"],
            ondelete="SET NULL",
        )
        op.create_foreign_key(
            f"fk_{table_name}_section",
            table_name,
            "sections",
            ["section_id"],
            ["section_id"],
            ondelete="SET NULL",
        )
        op.create_foreign_key(
            f"fk_{table_name}_subsection",
            table_name,
            "subsections",
            ["subsection_id"],
            ["subsection_id"],
            ondelete="SET NULL",
        )

    # block_id FKs are intentionally omitted — some legacy rows reference
    # figure/table blocks that are not stored in the blocks table.

    # Ingestion lineage tables.
    op.create_table(
        "ingestion_runs",
        sa.Column("run_id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="started"),
        sa.Column("pipeline_version", sa.String(64), nullable=False, server_default="v1"),
        sa.Column("source_file_hash", sa.String(128), nullable=True),
        sa.Column("source_path", sa.String(1024), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("step10_path", sa.String(1024), nullable=True),
        sa.Column("stats", postgresql.JSONB(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
    )
    op.create_index("ix_ingestion_runs_book", "ingestion_runs", ["book_id"])
    op.create_index("ix_ingestion_runs_status", "ingestion_runs", ["status"])

    op.create_table(
        "book_versions",
        sa.Column("version_id", sa.String(64), primary_key=True),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("run_id", sa.Integer(), sa.ForeignKey("ingestion_runs.run_id", ondelete="CASCADE"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("activated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_book_versions_book", "book_versions", ["book_id"])
    op.create_index("ix_book_versions_active", "book_versions", ["book_id", "is_active"])

    # Long-run user progress skeleton.
    op.create_table(
        "users",
        sa.Column("user_id", sa.String(64), primary_key=True),
        sa.Column("external_ref", sa.String(128), nullable=True, unique=True),
        sa.Column("display_name", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "reading_progress",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("chapter_id", sa.String(64), sa.ForeignKey("chapters.chapter_id", ondelete="SET NULL"), nullable=True),
        sa.Column("section_id", sa.String(128), sa.ForeignKey("sections.section_id", ondelete="SET NULL"), nullable=True),
        sa.Column(
            "subsection_id",
            sa.String(128),
            sa.ForeignKey("subsections.subsection_id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("percent_complete", sa.Float(), nullable=False, server_default="0"),
        sa.Column("last_read_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "book_id", name="uq_reading_progress_user_book"),
    )
    op.create_index("ix_reading_progress_user", "reading_progress", ["user_id"])
    op.create_index("ix_reading_progress_book", "reading_progress", ["book_id"])

    op.create_table(
        "topic_completions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False),
        sa.Column("book_id", sa.String(64), sa.ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False),
        sa.Column("section_id", sa.String(128), sa.ForeignKey("sections.section_id", ondelete="SET NULL"), nullable=True),
        sa.Column(
            "subsection_id",
            sa.String(128),
            sa.ForeignKey("subsections.subsection_id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.String(32), nullable=False, server_default="app"),
        sa.UniqueConstraint(
            "user_id", "book_id", "section_id", "subsection_id", name="uq_topic_completion_scope"
        ),
    )
    op.create_index("ix_topic_completions_user_book", "topic_completions", ["user_id", "book_id"])


def downgrade() -> None:
    op.drop_index("ix_topic_completions_user_book", table_name="topic_completions")
    op.drop_table("topic_completions")
    op.drop_index("ix_reading_progress_book", table_name="reading_progress")
    op.drop_index("ix_reading_progress_user", table_name="reading_progress")
    op.drop_table("reading_progress")
    op.drop_table("users")
    op.drop_index("ix_book_versions_active", table_name="book_versions")
    op.drop_index("ix_book_versions_book", table_name="book_versions")
    op.drop_table("book_versions")
    op.drop_index("ix_ingestion_runs_status", table_name="ingestion_runs")
    op.drop_index("ix_ingestion_runs_book", table_name="ingestion_runs")
    op.drop_table("ingestion_runs")

    for table_name in ["glossary_entries", "tables", "activities", "figures"]:
        op.drop_constraint(f"fk_{table_name}_subsection", table_name, type_="foreignkey")
        op.drop_constraint(f"fk_{table_name}_section", table_name, type_="foreignkey")
        op.drop_constraint(f"fk_{table_name}_chapter", table_name, type_="foreignkey")

    op.drop_constraint("fk_paragraphs_subsection", "paragraphs", type_="foreignkey")
    op.drop_constraint("fk_paragraphs_section", "paragraphs", type_="foreignkey")
    op.drop_constraint("fk_paragraphs_chapter", "paragraphs", type_="foreignkey")
    op.drop_constraint("fk_blocks_subsection", "blocks", type_="foreignkey")
    op.drop_constraint("fk_blocks_section", "blocks", type_="foreignkey")
    op.drop_constraint("fk_blocks_chapter", "blocks", type_="foreignkey")
