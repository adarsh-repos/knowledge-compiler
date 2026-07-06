"""
Course & reading-path APIs — mapped to SarkariExams UI screens.

Screen 1: GET /api/courses
Screen 2: GET /api/courses/{book_id}
Screen 3: GET /api/courses/{book_id}/chapters/{chapter_id}/topics/{topic_id}/intro
Reading:  GET /api/courses/.../steps and /steps/{step_index}
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.db.session import get_db
from backend.services.courses import CoursesService

router = APIRouter(prefix="/api/courses", tags=["courses"])


def _svc(session: Session = Depends(get_db)) -> CoursesService:
    return CoursesService(session)


@router.get("")
def list_courses(svc: CoursesService = Depends(_svc)):
    """
    **Screen 1 — Courses home**

    Returns subject tracks, stats bar, how-it-works, and reading tips.
    Maps to: subjects list, chapters 0/N badges, Continue card.
    """
    return svc.list_courses()


@router.get("/{book_id}")
def get_course(book_id: str, svc: CoursesService = Depends(_svc)):
    """
    **Screen 2 — Chapter list for a book**

    Returns chapters with nested topics (subsections), page ranges, and progress placeholders.
    Maps to: breadcrumb, book title, chapter cards, topic rows, Start reading.
    """
    data = svc.get_course(book_id)
    if not data:
        raise HTTPException(404, "Course not found in canonical store — load book first")
    return data


@router.get("/{book_id}/chapters/{chapter_id}/topics/{topic_id}/intro")
def topic_intro(
    book_id: str,
    chapter_id: str,
    topic_id: str,
    svc: CoursesService = Depends(_svc),
):
    """
    **Screen 3 — Topic intro before reading**

    Returns breadcrumb, NCERT metadata, summary, cover tags, step count.
    Maps to: Step 1 of N, Mauryan Empire intro, You will cover tags.
    """
    data = svc.get_topic_intro(book_id, chapter_id, topic_id)
    if not data:
        raise HTTPException(404, "Topic not found")
    return data


@router.get("/{book_id}/chapters/{chapter_id}/topics/{topic_id}/steps")
def topic_steps(
    book_id: str,
    chapter_id: str,
    topic_id: str,
    svc: CoursesService = Depends(_svc),
):
    """
    All reading steps for a topic (section-by-section flow).

    Each step contains merged paragraphs, page label, estimated minutes, takeaway.
    """
    data = svc.get_reading_steps(book_id, chapter_id, topic_id)
    if not data:
        raise HTTPException(404, "Topic not found")
    return data


@router.get("/{book_id}/chapters/{chapter_id}/topics/{topic_id}/steps/{step_index}")
def topic_step(
    book_id: str,
    chapter_id: str,
    topic_id: str,
    step_index: int,
    svc: CoursesService = Depends(_svc),
):
    """
    Single reading step for Next/Previous navigation.

    `step_index` is 1-based (Step 1 of 5).
    """
    if step_index < 1:
        raise HTTPException(400, "step_index must be >= 1")
    data = svc.get_reading_step(book_id, chapter_id, topic_id, step_index)
    if not data:
        raise HTTPException(404, "Step not found")
    return data


@router.get("/{book_id}/continue")
def continue_reading(
    book_id: str,
    chapter_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    svc: CoursesService = Depends(_svc),
):
    """
    Continue reading card — resume URL for the orange sidebar widget.

    Without progress tracking, returns first chapter/topic or specified ids.
    """
    course = svc.get_course(book_id)
    if not course:
        raise HTTPException(404, "Course not found")

    chapters = course["chapters"]
    if not chapters:
        raise HTTPException(404, "No chapters")

    ch = next((c for c in chapters if c["chapter_id"] == chapter_id), chapters[0])
    topics = ch["topics"]
    topic = next((t for t in topics if t["topic_id"] == topic_id), topics[0] if topics else None)

    if not topic:
        raise HTTPException(404, "No topics in chapter")

    intro = svc.get_topic_intro(book_id, ch["chapter_id"], topic["topic_id"])
    return {
        "label": f"{course['subject']} · Ch. {ch['number']:02d}",
        "book_id": book_id,
        "chapter_id": ch["chapter_id"],
        "topic_id": topic["topic_id"],
        "title": topic["title"],
        "page_label": topic.get("page_label", ""),
        "estimated_minutes": intro["module"]["estimated_minutes"] if intro else None,
        "resume_url": (
            f"/courses/{book_id}/chapters/{ch['chapter_id']}/topics/{topic['topic_id']}"
        ),
    }
