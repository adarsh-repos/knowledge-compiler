from __future__ import annotations

import asyncio

from backend.models.schemas import PipelineStage
from backend.services.ai_worker import extract_structure
from backend.services.chapter_splitter import extract_chapter_text, split_chapters
from backend.services.ocr import run_ocr
from backend.services.store import store

_book_locks: dict[str, asyncio.Lock] = {}
_index_meta_cache: dict[str, dict] = {}


def _book_lock(book_id: str) -> asyncio.Lock:
    if book_id not in _book_locks:
        _book_locks[book_id] = asyncio.Lock()
    return _book_locks[book_id]


def is_book_extracting(book_id: str) -> bool:
    return any(
        c.stage == PipelineStage.AI_IN_PROGRESS
        for c in store.list_chapters(book_id)
    )


def _progress_callback(chapter_id: str):
    def report(step: str, label: str, current: int, total: int) -> None:
        store.update_chapter(
            chapter_id,
            extraction_progress={
                "step": step,
                "label": label,
                "current": current,
                "total": total,
                "level": "structure",
            },
        )

    return report


async def prepare_book(book_id: str) -> None:
    """OCR + map chapters from index/contents page only. No AI."""
    book = store.get_book(book_id)
    if not book:
        return

    try:
        pdf_path = store.book_upload_path(book_id, book.filename)
        ocr_path = store.ocr_book_path(book_id)

        store.update_book(book_id, stage=PipelineStage.PENDING_OCR)
        loop = asyncio.get_event_loop()
        full_text = await loop.run_in_executor(None, run_ocr, pdf_path, ocr_path, None)
        store.update_book(book_id, stage=PipelineStage.OCR_COMPLETE)

        chapters, index_meta = split_chapters(full_text, book_id)
        _index_meta_cache[book_id] = index_meta
        store.replace_chapters_for_book(book_id, chapters)

        for chapter in chapters:
            chapter_text = extract_chapter_text(full_text, chapter)
            chapter_ocr = store.chapter_ocr_path(book_id, chapter.number)
            chapter_ocr.parent.mkdir(parents=True, exist_ok=True)
            chapter_ocr.write_text(chapter_text, encoding="utf-8")

        store.update_book(
            book_id,
            stage=PipelineStage.CHAPTERS_FOUND,
            chapter_count=len(chapters),
            error=None,
        )

    except Exception as exc:
        store.update_book(book_id, stage=PipelineStage.FAILED, error=str(exc))
        raise


async def extract_chapter_structure(chapter_id: str, *, force: bool = False) -> dict:
    """Pass 1 structure for one chapter — rulebook only, one at a time."""
    chapter = store.get_chapter(chapter_id)
    if not chapter:
        raise ValueError("Chapter not found")

    book = store.get_book(chapter.book_id)
    if not book:
        raise ValueError("Book not found")

    if chapter.json_path and not force:
        if chapter.stage in (
            PipelineStage.PENDING_REVIEW,
            PipelineStage.APPROVED,
            PipelineStage.PUBLISHED,
        ):
            raise ValueError("Structure already extracted. Use force=true to re-run.")

    lock = _book_lock(chapter.book_id)
    if lock.locked() or is_book_extracting(chapter.book_id):
        raise ValueError("Another chapter is being processed. One action at a time.")

    async with lock:
        store.update_chapter(
            chapter_id,
            stage=PipelineStage.AI_IN_PROGRESS,
            extraction_progress={
                "step": "starting",
                "label": "Loading chapter from index page range…",
                "current": 0,
                "total": 2,
                "level": "structure",
            },
        )

        try:
            ocr_path = store.ocr_book_path(chapter.book_id)
            if not ocr_path.exists():
                raise FileNotFoundError("OCR text not found. Run index mapping first.")

            full_text = ocr_path.read_text(encoding="utf-8")
            chapter_text = extract_chapter_text(full_text, chapter)
            progress = _progress_callback(chapter_id)

            printed_start = chapter.printed_page_start or 1
            printed_end = chapter.printed_page_end or printed_start
            index_meta = _index_meta_cache.get(chapter.book_id)

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: extract_structure(
                    book.title,
                    chapter.number,
                    chapter.title,
                    chapter_text,
                    printed_start,
                    printed_end,
                    index_meta=index_meta,
                    on_progress=progress,
                ),
            )

            if chapter.section:
                result.setdefault("chapter", {})["section"] = chapter.section
            if chapter.roman_numeral:
                result.setdefault("chapter", {})["roman_numeral"] = chapter.roman_numeral

            json_path = store.chapter_json_path(
                chapter.book_id, chapter.number, chapter.title
            )
            store.save_json(json_path, result)

            store.update_chapter(
                chapter_id,
                stage=PipelineStage.PENDING_REVIEW,
                json_path=str(json_path),
                token_usage=result.get("_meta", {}).get("token_usage"),
                extraction_level="structure",
                extraction_progress=None,
            )

            return {
                "chapter_id": chapter_id,
                "json_path": str(json_path),
                "token_usage": result.get("_meta", {}).get("token_usage"),
                "extraction_level": "structure",
            }

        except Exception as exc:
            store.update_chapter(
                chapter_id,
                stage=PipelineStage.CHAPTERS_FOUND if not chapter.json_path else PipelineStage.PENDING_REVIEW,
                extraction_progress=None,
            )
            raise exc
