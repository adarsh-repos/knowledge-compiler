"""
Shape canonical DB data for SarkariExams course/reading UI.
"""

from __future__ import annotations

import math
import re
from typing import Any, Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.db.models import (
    BookRow,
    ChapterRow,
    GlossaryEntryRow,
    ParagraphRow,
    SectionRow,
    SubsectionRow,
)
from backend.db.repository import CanonicalRepository

WORDS_PER_MINUTE = 200
OVERVIEW_NUMBER = "0"

HOW_IT_WORKS = [
    {
        "step": 1,
        "title": "Pick a subject",
        "description": "Choose Polity, History, or another track below.",
    },
    {
        "step": 2,
        "title": "Read the chapter",
        "description": "Step-by-step NCERT reading with key takeaways.",
    },
    {
        "step": 3,
        "title": "Practice & mark done",
        "description": "Attempt PYQs, then mark the chapter complete.",
    },
]

READING_TIPS = [
    "One chapter at a time — finish reading before jumping to PYQs.",
    "Use takeaway boxes at the end of each section for revision.",
    "Mark complete only after you can explain the topic in 5 lines.",
]


def _page_label(start: Optional[int], end: Optional[int]) -> str:
    if start is None:
        return ""
    if end is None or end == start:
        return f"pp. {start}"
    return f"pp. {start}–{end}"


def _reading_minutes(text: str) -> int:
    words = len(re.findall(r"\w+", text or ""))
    return max(1, math.ceil(words / WORDS_PER_MINUTE))


def _excerpt(text: str, limit: int = 220) -> str:
    t = (text or "").strip()
    if len(t) <= limit:
        return t
    return t[: limit - 1].rsplit(" ", 1)[0] + "…"


class CoursesService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repo = CanonicalRepository(session)

    def list_courses(self) -> dict[str, Any]:
        books = list(
            self.session.scalars(select(BookRow).order_by(BookRow.subject, BookRow.class_level))
        )
        subjects = []
        total_chapters = 0
        for book in books:
            chapters = self.repo.list_chapters(book.book_id)
            ch_total = len(chapters)
            total_chapters += ch_total
            subjects.append(
                {
                    "book_id": book.book_id,
                    "subject": book.subject,
                    "title": book.title,
                    "class_level": book.class_level,
                    "subtitle": f"{book.title} · Class {book.class_level}",
                    "chapters_completed": 0,
                    "chapters_total": ch_total,
                    "topics_total": self._count_topics(book.book_id),
                    "loaded": True,
                    "validation_passed": book.validation_passed,
                }
            )

        continue_item = self._default_continue(books)

        if continue_item and continue_item.get("topic_id"):
            continue_item["resume_url"] = (
                f"/learn?book={continue_item['book_id']}"
                f"&chapter={continue_item['chapter_id']}"
                f"&topic={continue_item['topic_id']}"
            )

        return {
            "stats": {
                "subjects_count": len(subjects),
                "chapters_read": 0,
                "chapters_total": total_chapters,
                "continue": continue_item,
            },
            "how_it_works": HOW_IT_WORKS,
            "reading_tips": READING_TIPS,
            "subjects": subjects,
        }

    def get_course(self, book_id: str) -> Optional[dict[str, Any]]:
        book = self.repo.get_book(book_id)
        if not book:
            return None

        chapters_out = []
        topics_total = 0
        for ch in self.repo.list_chapters(book_id):
            topics = self._chapter_topics(book_id, ch)
            units = self._reading_units(topics)
            topics_total += len(topics)
            ch_pages = self._chapter_page_range(book_id, ch.chapter_id)
            chapters_out.append(
                {
                    "chapter_id": ch.chapter_id,
                    "number": ch.number,
                    "roman": ch.roman,
                    "title": ch.title,
                    "subtitle": f"Ch. {ch.number} — {ch.title}",
                    "description": self._chapter_description(book_id, ch.chapter_id),
                    "printed_start": ch.printed_start,
                    "printed_end": ch.printed_end,
                    "page_label": _page_label(ch_pages["start"], ch_pages["end"]),
                    "topics_completed": 0,
                    "topics_total": len(topics),
                    "reading_units_total": len(units),
                    "reading_units_completed": 0,
                    "progress_percent": 0,
                    "topics": topics,
                }
            )

        return {
            "book_id": book.book_id,
            "subject": book.subject,
            "title": book.title,
            "class_level": book.class_level,
            "breadcrumb": ["Courses", book.subject],
            "progress": {
                "topics_read": 0,
                "topics_total": topics_total,
            },
            "chapters": chapters_out,
        }

    def get_topic_intro(
        self,
        book_id: str,
        chapter_id: str,
        topic_id: str,
    ) -> Optional[dict[str, Any]]:
        ctx = self._resolve_topic(book_id, chapter_id, topic_id)
        if not ctx:
            return None

        book, chapter, section, subsection = ctx
        scope_section = section.section_id if section else None
        scope_sub = subsection.subsection_id if subsection else None
        title = subsection.title if subsection else (section.title if section else "")
        number = subsection.number if subsection else (section.number if section else "")

        paragraphs = self.repo.get_topic_content(
            book_id,
            chapter_id=chapter_id,
            section_id=scope_section if not scope_sub else section.section_id if section else None,
            subsection_id=scope_sub,
            limit=50,
        )["paragraphs"]

        body_text = " ".join(p["text"] for p in paragraphs[:3])
        page_range = self._scope_page_range(book_id, chapter_id, scope_section, scope_sub)
        steps = self._reading_steps(book_id, chapter_id, topic_id)
        tags = self._cover_tags(book, chapter, section, subsection, paragraphs)

        return {
            "book_id": book_id,
            "chapter_id": chapter_id,
            "topic_id": topic_id,
            "breadcrumb": [
                book.subject,
                f"Ch. {chapter.number:02d}",
                title,
            ],
            "module": {
                "type": "NCERT Reading",
                "source": "NCERT",
                "chapter_label": f"Ch. {chapter.number} — {chapter.title}",
                "page_label": _page_label(page_range["start"], page_range["end"]),
                "estimated_minutes": _reading_minutes(body_text),
            },
            "step": {"current": 1, "total": max(len(steps), 1)},
            "title": title,
            "topic_number": number,
            "summary": _excerpt(body_text, 280),
            "cover_tags": tags,
            "instruction": "Tap Next to read section by section. Takeaways appear at the end of each section.",
            "steps_preview": steps[:5],
        }

    def get_reading_steps(
        self,
        book_id: str,
        chapter_id: str,
        topic_id: str,
    ) -> Optional[dict[str, Any]]:
        ctx = self._resolve_topic(book_id, chapter_id, topic_id)
        if not ctx:
            return None
        book, chapter, section, subsection = ctx
        steps = self._reading_steps(book_id, chapter_id, topic_id)
        title = subsection.title if subsection else (section.title if section else "")

        return {
            "book_id": book_id,
            "chapter_id": chapter_id,
            "topic_id": topic_id,
            "chapter_title": chapter.title,
            "topic_title": title,
            "breadcrumb": [book.subject, f"Ch. {chapter.number:02d}", title],
            "total_steps": len(steps),
            "steps": steps,
        }

    def get_reading_step(
        self,
        book_id: str,
        chapter_id: str,
        topic_id: str,
        step_index: int,
    ) -> Optional[dict[str, Any]]:
        payload = self.get_reading_steps(book_id, chapter_id, topic_id)
        if not payload:
            return None
        steps = payload["steps"]
        if step_index < 1 or step_index > len(steps):
            return None
        step = steps[step_index - 1]
        return {
            **payload,
            "step": {
                "current": step_index,
                "total": len(steps),
                "previous": step_index > 1,
                "next": step_index < len(steps),
            },
            "content": step,
        }

    def _count_topics(self, book_id: str) -> int:
        """Count section-level topics (matches pipeline hierarchy / admin UI)."""
        return int(
            self.session.scalar(
                select(func.count())
                .select_from(SectionRow)
                .where(
                    SectionRow.book_id == book_id,
                    SectionRow.is_overview.is_(False),
                    SectionRow.number != OVERVIEW_NUMBER,
                )
            )
            or 0
        )

    def _topic_ref(
        self,
        book_id: str,
        chapter_id: str,
        section_id: str,
        *,
        topic_id: str,
        topic_type: str,
        subsection_id: Optional[str],
        number: str,
        title: str,
    ) -> dict[str, Any]:
        pages = self._scope_page_range(book_id, chapter_id, section_id, subsection_id)
        return {
            "topic_id": topic_id,
            "topic_type": topic_type,
            "section_id": section_id,
            "subsection_id": subsection_id,
            "number": number,
            "title": title,
            "page_start": pages["start"],
            "page_end": pages["end"],
            "page_label": _page_label(pages["start"], pages["end"]),
            "completed": False,
        }

    def _chapter_topics(self, book_id: str, chapter: ChapterRow) -> list[dict[str, Any]]:
        """Section-level topics with nested subtopics — mirrors pipeline step 6 hierarchy."""
        topics: list[dict[str, Any]] = []
        sections = self.repo.list_sections(book_id, chapter.chapter_id)
        for sec in sections:
            if sec.is_overview or sec.number == OVERVIEW_NUMBER:
                continue
            subs = self.repo.list_subsections(book_id, sec.section_id)
            subtopics = [
                self._topic_ref(
                    book_id,
                    chapter.chapter_id,
                    sec.section_id,
                    topic_id=sub.subsection_id,
                    topic_type="subsection",
                    subsection_id=sub.subsection_id,
                    number=sub.number,
                    title=sub.title,
                )
                for sub in subs
            ]
            sec_pages = self._scope_page_range(book_id, chapter.chapter_id, sec.section_id, None)
            topics.append(
                {
                    "topic_id": sec.section_id,
                    "topic_type": "section",
                    "section_id": sec.section_id,
                    "subsection_id": None,
                    "number": sec.number,
                    "title": sec.title,
                    "label": f"Topic {sec.number}",
                    "page_start": sec_pages["start"],
                    "page_end": sec_pages["end"],
                    "page_label": _page_label(sec_pages["start"], sec_pages["end"]),
                    "subtopics_count": len(subtopics),
                    "subtopics": subtopics,
                    "completed": False,
                }
            )
        return topics

    def _reading_units(self, topics: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Leaf reading targets: subtopics when present, else the section itself."""
        units: list[dict[str, Any]] = []
        for topic in topics:
            subs = topic.get("subtopics") or []
            if subs:
                units.extend(subs)
            else:
                units.append(topic)
        return units

    def _chapter_page_range(self, book_id: str, chapter_id: str) -> dict[str, Optional[int]]:
        row = self.session.execute(
            select(
                func.min(ParagraphRow.page),
                func.max(ParagraphRow.page),
            ).where(
                ParagraphRow.book_id == book_id,
                ParagraphRow.chapter_id == chapter_id,
            )
        ).one()
        return {"start": row[0], "end": row[1]}

    def _scope_page_range(
        self,
        book_id: str,
        chapter_id: str,
        section_id: Optional[str],
        subsection_id: Optional[str],
    ) -> dict[str, Optional[int]]:
        stmt = select(func.min(ParagraphRow.page), func.max(ParagraphRow.page)).where(
            ParagraphRow.book_id == book_id,
            ParagraphRow.chapter_id == chapter_id,
        )
        if subsection_id:
            stmt = stmt.where(ParagraphRow.subsection_id == subsection_id)
        elif section_id:
            stmt = stmt.where(ParagraphRow.section_id == section_id)
        row = self.session.execute(stmt).one()
        return {"start": row[0], "end": row[1]}

    def _chapter_description(self, book_id: str, chapter_id: str) -> str:
        para = self.session.scalar(
            select(ParagraphRow)
            .where(
                ParagraphRow.book_id == book_id,
                ParagraphRow.chapter_id == chapter_id,
            )
            .order_by(ParagraphRow.order)
            .limit(1)
        )
        return _excerpt(para.text if para else "", 120)

    def _resolve_topic(
        self,
        book_id: str,
        chapter_id: str,
        topic_id: str,
    ) -> Optional[tuple[BookRow, ChapterRow, Optional[SectionRow], Optional[SubsectionRow]]]:
        book = self.repo.get_book(book_id)
        chapter = self.repo.get_chapter(book_id, chapter_id)
        if not book or not chapter:
            return None

        sub = self.session.get(SubsectionRow, topic_id)
        if sub and sub.book_id == book_id and sub.chapter_id == chapter_id:
            sec = self.session.get(SectionRow, sub.section_id)
            return book, chapter, sec, sub

        sec = self.session.get(SectionRow, topic_id)
        if sec and sec.book_id == book_id and sec.chapter_id == chapter_id:
            return book, chapter, sec, None

        return None

    def _reading_steps(self, book_id: str, chapter_id: str, topic_id: str) -> list[dict[str, Any]]:
        ctx = self._resolve_topic(book_id, chapter_id, topic_id)
        if not ctx:
            return []
        _, _, section, subsection = ctx

        if subsection:
            paragraphs = self._paragraph_rows(
                book_id, chapter_id, section.section_id if section else None, subsection.subsection_id
            )
            return self._paragraphs_to_steps(
                paragraphs,
                step_prefix=subsection.title,
                subsection_id=subsection.subsection_id,
            )

        if section:
            subs = self.repo.list_subsections(book_id, section.section_id)
            if subs:
                steps: list[dict[str, Any]] = []
                for sub in subs:
                    paras = self._paragraph_rows(book_id, chapter_id, section.section_id, sub.subsection_id)
                    steps.extend(
                        self._paragraphs_to_steps(
                            paras,
                            step_prefix=sub.title,
                            subsection_id=sub.subsection_id,
                        )
                    )
                return steps
            paragraphs = self._paragraph_rows(book_id, chapter_id, section.section_id, None)
            return self._paragraphs_to_steps(
                paragraphs,
                step_prefix=section.title,
                section_id=section.section_id,
            )
        return []

    def _paragraph_rows(
        self,
        book_id: str,
        chapter_id: str,
        section_id: Optional[str],
        subsection_id: Optional[str],
    ) -> list[ParagraphRow]:
        stmt = (
            select(ParagraphRow)
            .where(
                ParagraphRow.book_id == book_id,
                ParagraphRow.chapter_id == chapter_id,
            )
            .order_by(ParagraphRow.order)
        )
        if subsection_id:
            stmt = stmt.where(ParagraphRow.subsection_id == subsection_id)
        elif section_id:
            stmt = stmt.where(ParagraphRow.section_id == section_id)
        return list(self.session.scalars(stmt))

    def _paragraphs_to_steps(
        self,
        paragraphs: list[ParagraphRow],
        *,
        step_prefix: str,
        section_id: Optional[str] = None,
        subsection_id: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        if not paragraphs:
            return [
                {
                    "step_index": 1,
                    "title": step_prefix,
                    "section_id": section_id,
                    "subsection_id": subsection_id,
                    "page_label": "",
                    "estimated_minutes": 1,
                    "paragraphs": [],
                    "figures": [],
                    "glossary": [],
                    "takeaway": None,
                }
            ]

        steps: list[dict[str, Any]] = []
        chunk: list[ParagraphRow] = []
        chunk_pages: list[int] = []

        for para in paragraphs:
            chunk.append(para)
            chunk_pages.append(para.page)
            word_count = sum(len(re.findall(r"\w+", p.text or "")) for p in chunk)
            if word_count >= 120 or len(chunk) >= 3:
                steps.append(
                    self._build_step(chunk, step_prefix, section_id, subsection_id, len(steps) + 1, chunk_pages)
                )
                chunk = []
                chunk_pages = []

        if chunk:
            steps.append(
                self._build_step(chunk, step_prefix, section_id, subsection_id, len(steps) + 1, chunk_pages)
            )
        return steps

    def _build_step(
        self,
        chunk: list[ParagraphRow],
        step_prefix: str,
        section_id: Optional[str],
        subsection_id: Optional[str],
        step_index: int,
        pages: list[int],
    ) -> dict[str, Any]:
        text = "\n\n".join(p.text for p in chunk)
        page_start = min(pages) if pages else None
        page_end = max(pages) if pages else None
        return {
            "step_index": step_index,
            "title": step_prefix if step_index == 1 else f"{step_prefix} (cont.)",
            "section_id": section_id,
            "subsection_id": subsection_id,
            "page_label": _page_label(page_start, page_end),
            "estimated_minutes": _reading_minutes(text),
            "paragraphs": [
                {
                    "paragraph_id": p.paragraph_id,
                    "text": p.text,
                    "page": p.page,
                    "order": p.order,
                }
                for p in chunk
            ],
            "takeaway": _excerpt(text, 160),
        }

    def _cover_tags(
        self,
        book: BookRow,
        chapter: ChapterRow,
        section: Optional[SectionRow],
        subsection: Optional[SubsectionRow],
        paragraphs: list[dict],
    ) -> list[str]:
        tags = [book.subject, chapter.title]
        if subsection:
            tags.append(subsection.title)
        elif section:
            tags.append(section.title)
        tags.append("Key definitions")
        tags.append("Exam relevance")
        return tags[:5]

    def _default_continue(self, books: list[BookRow]) -> Optional[dict[str, Any]]:
        if not books:
            return None
        book = books[0]
        chapters = self.repo.list_chapters(book.book_id)
        if not chapters:
            return None
        ch = chapters[0]
        topics = self._chapter_topics(book.book_id, ch)
        units = self._reading_units(topics)
        if not units:
            return {
                "label": f"{book.subject} Ch.{ch.number}",
                "book_id": book.book_id,
                "chapter_id": ch.chapter_id,
                "topic_id": None,
                "title": ch.title,
            }
        unit = units[0]
        return {
            "label": f"{book.subject} Ch.{ch.number}",
            "book_id": book.book_id,
            "chapter_id": ch.chapter_id,
            "topic_id": unit["topic_id"],
            "title": unit["title"],
            "page_label": unit.get("page_label", ""),
        }

    def get_next_topic(
        self,
        book_id: str,
        chapter_id: str,
        topic_id: str,
    ) -> Optional[dict[str, Any]]:
        """Return the next topic in canonical reading order after the current one."""
        flat = self._flatten_topics(book_id)
        if not flat:
            return None

        idx = next(
            (
                i
                for i, t in enumerate(flat)
                if t["chapter_id"] == chapter_id and t["topic_id"] == topic_id
            ),
            None,
        )
        if idx is None:
            return None

        book = self.repo.get_book(book_id)
        current = flat[idx]
        next_item = flat[idx + 1] if idx + 1 < len(flat) else None
        completed_count = idx + 1

        payload: dict[str, Any] = {
            "book_id": book_id,
            "subject": book.subject if book else "",
            "current": {
                "chapter_id": chapter_id,
                "chapter_number": current["chapter_number"],
                "chapter_title": current["chapter_title"],
                "topic_id": topic_id,
                "title": current["title"],
                "index": idx,
            },
            "has_next": next_item is not None,
            "next": None,
            "progress": {
                "topics_completed": completed_count,
                "topics_total": len(flat),
                "topics_remaining": len(flat) - completed_count,
                "percent_complete": round((completed_count / len(flat)) * 100) if flat else 0,
            },
        }

        if next_item:
            payload["next"] = {
                "chapter_id": next_item["chapter_id"],
                "chapter_number": next_item["chapter_number"],
                "chapter_title": next_item["chapter_title"],
                "topic_id": next_item["topic_id"],
                "title": next_item["title"],
                "page_label": next_item.get("page_label", ""),
                "resume_url": (
                    f"/learn?book={book_id}"
                    f"&chapter={next_item['chapter_id']}"
                    f"&topic={next_item['topic_id']}"
                ),
            }

        return payload

    def _flatten_topics(self, book_id: str) -> list[dict[str, Any]]:
        course = self.get_course(book_id)
        if not course:
            return []

        flat: list[dict[str, Any]] = []
        for ch in course["chapters"]:
            for unit in self._reading_units(ch["topics"]):
                flat.append(
                    {
                        **unit,
                        "chapter_id": ch["chapter_id"],
                        "chapter_number": ch["number"],
                        "chapter_title": ch["title"],
                        "chapter_roman": ch["roman"],
                    }
                )
        return flat
