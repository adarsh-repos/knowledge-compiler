from __future__ import annotations

import re

from backend.services.rulebook import rulebook_summary
from backend.services.structure_parser import parse_ncert_structure


def extract_structure(
    book_title: str,
    chapter_number: int,
    chapter_title: str,
    chapter_text: str,
    printed_start: int,
    printed_end: int,
    index_meta: dict | None = None,
    on_progress=None,
) -> dict:
    """Pass 1 — structure via rulebook (index page range + topic patterns)."""
    if on_progress:
        on_progress(
            "rulebook",
            f"Applying rules on printed pages {printed_start}–{printed_end}…",
            0,
            2,
        )

    pages_meta = []
    for m in re.finditer(
        r"--- PDF page (\d+) \| Printed page (\d+) ---\n(.*?)(?=\n--- PDF page|\Z)",
        chapter_text,
        re.DOTALL,
    ):
        pages_meta.append(
            {
                "pdf_page": int(m.group(1)),
                "printed_page": int(m.group(2)),
                "text": m.group(3),
            }
        )

    if on_progress:
        on_progress("topics", "Rules 5–6: detecting topics & subtopics…", 1, 2)

    structure = parse_ncert_structure(chapter_text, printed_start, printed_end)

    if on_progress:
        on_progress("done", f"Found {structure['topic_count']} topics", 2, 2)

    return {
        "book": {"title": book_title},
        "chapter": {
            "number": chapter_number,
            "title": chapter_title,
            "printed_page_start": printed_start,
            "printed_page_end": printed_end,
        },
        "structure": structure,
        "_meta": {
            "pass": 1,
            "pass_name": "structure",
            "extraction_level": "structure",
            "method": "rulebook",
            "index_mapping": index_meta,
            "rulebook": rulebook_summary(),
            "token_usage": {
                "total": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
                "passes": [],
                "request_count": 0,
                "model": "none",
            },
        },
    }
