from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

from backend.models.schemas import Book, Chapter, PipelineStage

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
UPLOADS_DIR = ROOT / "uploads"
OCR_DIR = ROOT / "ocr_output"
JSON_DIR = ROOT / "json_output"
PIPELINE_DIR = ROOT / "pipeline_output"

BOOKS_FILE = DATA_DIR / "books.json"
CHAPTERS_FILE = DATA_DIR / "chapters.json"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _save(path: Path, data: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s_-]+", "-", text).strip("-") or "item"


class Store:
    def list_books(self) -> list[Book]:
        return [Book(**b) for b in _load(BOOKS_FILE)]

    def get_book(self, book_id: str) -> Book | None:
        for book in self.list_books():
            if book.id == book_id:
                return book
        return None

    def create_book(self, title: str, subject: str, class_level: str, filename: str) -> Book:
        books = _load(BOOKS_FILE)
        book = Book(
            id=str(uuid.uuid4()),
            title=title,
            subject=subject,
            class_level=class_level,
            filename=filename,
            created_at=_now(),
            updated_at=_now(),
        )
        books.append(book.model_dump())
        _save(BOOKS_FILE, books)
        return book

    def update_book(self, book_id: str, **kwargs) -> Book | None:
        books = _load(BOOKS_FILE)
        for i, raw in enumerate(books):
            if raw["id"] == book_id:
                raw.update(kwargs)
                raw["updated_at"] = _now()
                books[i] = raw
                _save(BOOKS_FILE, books)
                return Book(**raw)
        return None

    def list_chapters(self, book_id: str | None = None) -> list[Chapter]:
        chapters = [Chapter(**c) for c in _load(CHAPTERS_FILE)]
        if book_id:
            chapters = [c for c in chapters if c.book_id == book_id]
        return sorted(chapters, key=lambda c: c.number)

    def get_chapter(self, chapter_id: str) -> Chapter | None:
        for chapter in self.list_chapters():
            if chapter.id == chapter_id:
                return chapter
        return None

    def save_chapters(self, chapters: list[Chapter]) -> None:
        existing = {c.id: c for c in self.list_chapters()}
        for chapter in chapters:
            existing[chapter.id] = chapter
        _save(CHAPTERS_FILE, [c.model_dump() for c in existing.values()])

    def replace_chapters_for_book(self, book_id: str, chapters: list[Chapter]) -> None:
        kept = [c for c in self.list_chapters() if c.book_id != book_id]
        kept.extend(chapters)
        _save(CHAPTERS_FILE, [c.model_dump() for c in kept])

    def update_chapter(self, chapter_id: str, **kwargs) -> Chapter | None:
        chapters = _load(CHAPTERS_FILE)
        for i, raw in enumerate(chapters):
            if raw["id"] == chapter_id:
                raw.update(kwargs)
                chapters[i] = raw
                _save(CHAPTERS_FILE, chapters)
                return Chapter(**raw)
        return None

    def book_upload_path(self, book_id: str, filename: str) -> Path:
        dest = UPLOADS_DIR / book_id / filename
        dest.parent.mkdir(parents=True, exist_ok=True)
        return dest

    def ocr_book_path(self, book_id: str) -> Path:
        return OCR_DIR / book_id / "full_text.md"

    def chapter_ocr_path(self, book_id: str, chapter_number: int) -> Path:
        return OCR_DIR / book_id / f"chapter_{chapter_number:02d}.md"

    def chapter_json_path(self, book_id: str, chapter_number: int, title: str) -> Path:
        name = f"chapter_{chapter_number:02d}_{slugify(title)}.json"
        dest = JSON_DIR / book_id / name
        dest.parent.mkdir(parents=True, exist_ok=True)
        return dest

    def chapter_json_path_from_str(self, path_str: str) -> Path:
        return Path(path_str)

    def book_consolidated_path(self, book_id: str) -> Path:
        dest = JSON_DIR / book_id / "book_consolidated.json"
        dest.parent.mkdir(parents=True, exist_ok=True)
        return dest

    def pipeline_dir(self, book_id: str) -> Path:
        dest = PIPELINE_DIR / book_id
        dest.mkdir(parents=True, exist_ok=True)
        return dest

    def step01_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step01_pdf_reader.json"

    def step02_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step02_layout_extraction.json"

    def step03_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step03_content_blocks.json"

    def step04_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step04_reading_order.json"

    def step05_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step05_block_classification.json"

    def step06_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step06_hierarchy.json"

    def step07_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step07_paragraphs.json"

    def step08_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step08_image_table.json"

    def step08_images_dir(self, book_id: str) -> Path:
        dest = self.pipeline_dir(book_id) / "images"
        dest.mkdir(parents=True, exist_ok=True)
        return dest

    def step09_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step09_validation.json"

    def step10_output_path(self, book_id: str) -> Path:
        return self.pipeline_dir(book_id) / "step10_canonical.json"

    def save_json(self, path: Path, data: dict) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    def load_json(self, path: Path) -> dict:
        return json.loads(path.read_text(encoding="utf-8"))


store = Store()
