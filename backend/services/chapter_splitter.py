from __future__ import annotations

import uuid

from backend.models.schemas import Chapter, PipelineStage
from backend.services.rulebook import IndexChapter, parse_index_entries
from backend.services.structure_parser import extract_by_printed_range


def split_chapters(full_text: str, book_id: str) -> tuple[list[Chapter], dict]:
    """
    Map chapters ONLY from the index/contents page (rulebook).
    No body-text guessing, no regex on exercise questions.
    """
    index_chapters, index_meta = parse_index_entries(full_text)

    if not index_chapters:
        return [
            Chapter(
                id=str(uuid.uuid4()),
                book_id=book_id,
                number=1,
                title="Full Document",
                page_start=1,
                page_end=1,
                stage=PipelineStage.CHAPTERS_FOUND,
            )
        ], index_meta

    chapters: list[Chapter] = []
    for entry in index_chapters:
        chapters.append(_chapter_from_index(book_id, entry))

    return chapters, index_meta


def _chapter_from_index(book_id: str, entry: IndexChapter) -> Chapter:
    return Chapter(
        id=str(uuid.uuid4()),
        book_id=book_id,
        number=entry.number,
        title=entry.title,
        page_start=entry.printed_start,
        page_end=entry.printed_end,
        stage=PipelineStage.CHAPTERS_FOUND,
        section=entry.section,
        roman_numeral=entry.roman,
        printed_page_start=entry.printed_start,
        printed_page_end=entry.printed_end,
    )


def extract_chapter_text(full_text: str, chapter: Chapter) -> str:
    """Rule 4: extract text for index-defined printed page range."""
    start = chapter.printed_page_start or chapter.page_start or 1
    end = chapter.printed_page_end or chapter.page_end or start
    text, _ = extract_by_printed_range(full_text, start, end)
    return text
