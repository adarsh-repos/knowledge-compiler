"""
NCERT Contents-Page Rulebook
============================
All chapter boundaries and topic structure follow these rules — no AI, no guessing.

Rule 1 — FIND INDEX PAGE
  Scan PDF pages 1–15 for the word "Contents".
  That page (+ next page if needed) is the only source for chapter boundaries.

Rule 2 — READ CHAPTER FROM INDEX
  Each chapter line:  {Roman}. {Title}
  Next line (if digits only): printed start page.
  Example:  I. The Rise of Nationalism in Europe  →  3

Rule 3 — CHAPTER PAGE RANGE
  printed_start = start page from index for this chapter
  printed_end   = (next chapter start page) − 1
  Example Chapter I: start 3, next chapter II starts 25 → scan pages 3–24

Rule 4 — EXTRACT TEXT
  Only include PDF pages whose footer/header printed number is in [start, end].

Rule 5 — TOPICS (main headings)
  Pattern: single digit + spaces + title  (e.g. "1  The French Revolution…")
  Take the FIRST occurrence per number inside the chapter page range.
  Title must start with: The / Nationalism and / Visualising

Rule 6 — SUBTOPICS
  Pattern: N.M + title  (e.g. "4.1 Germany – Can the Army…")
  Take the FIRST occurrence per N.M inside topic N's section.
  Section = from earliest "N" or "N.M" line until topic N+1 starts
  (NCERT often lists 2.1 before the "2  Title" heading).
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from backend.services.ocr import parse_pages_from_markdown

ROMAN_ALT = r"(?:VIII|VII|VI|IV|V|III|II|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|I)"

TOC_ENTRY_RE = re.compile(
    rf"^({ROMAN_ALT})\.\s+(.+?)\s*$",
    re.MULTILINE,
)
SECTION_RE = re.compile(
    r"^Section\s+[IVXLC]+:\s*(.+?)\s*$",
    re.MULTILINE | re.IGNORECASE,
)


@dataclass
class IndexChapter:
    roman: str
    number: int
    title: str
    printed_start: int
    printed_end: int
    section: str | None


def roman_to_int(roman: str) -> int:
    values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = prev = 0
    for ch in reversed(roman.upper()):
        v = values[ch]
        total += v if v >= prev else -v
        prev = v
    return total


def find_contents_pdf_pages(full_text: str) -> list[int]:
    """Rule 1: locate index/contents page(s)."""
    pages = parse_pages_from_markdown(full_text)
    found: list[int] = []
    for p in pages:
        if p["page"] > 15:
            break
        if re.search(r"\bContents\b", p["text"], re.IGNORECASE):
            found.append(p["page"])
            if p["page"] + 1 <= (pages[-1]["page"] if pages else p["page"]):
                found.append(p["page"] + 1)
            break
    return found or [2]


def parse_index_entries(full_text: str) -> tuple[list[IndexChapter], dict]:
    """
    Rules 2–3: parse contents page only → chapter list with printed ranges.
    Returns (chapters, rule_metadata).
    """
    pdf_pages = find_contents_pdf_pages(full_text)
    raw_pages = parse_pages_from_markdown(full_text)
    index_text = "\n".join(
        p["text"] for p in raw_pages if p["page"] in pdf_pages
    )

    if "Contents" not in index_text:
        return [], {"error": "Contents page not found", "index_pdf_pages": pdf_pages}

    lines = index_text.splitlines()
    raw_entries: list[dict] = []
    current_section: str | None = None
    i = 0

    while i < len(lines):
        line = lines[i].strip()
        if not line or line in {"Contents", "xi", "iii", "ix"}:
            i += 1
            continue
        if SECTION_RE.match(line):
            current_section = line
            i += 1
            continue
        toc_match = TOC_ENTRY_RE.match(line)
        if toc_match:
            roman = toc_match.group(1).upper()
            title = re.sub(r"\s+", " ", toc_match.group(2).strip())
            printed_start: int | None = None
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and re.fullmatch(r"\d{1,4}", lines[j].strip()):
                printed_start = int(lines[j].strip())
                i = j
            if printed_start is not None:
                raw_entries.append(
                    {
                        "roman": roman,
                        "number": roman_to_int(roman),
                        "title": title,
                        "printed_start": printed_start,
                        "section": current_section,
                    }
                )
        i += 1

    # Deduplicate by chapter number
    seen: dict[int, dict] = {}
    for e in raw_entries:
        if e["number"] not in seen:
            seen[e["number"]] = e
    ordered = [seen[n] for n in sorted(seen)]

    chapters: list[IndexChapter] = []
    for i, e in enumerate(ordered):
        end = ordered[i + 1]["printed_start"] - 1 if i + 1 < len(ordered) else e["printed_start"] + 50
        chapters.append(
            IndexChapter(
                roman=e["roman"],
                number=e["number"],
                title=e["title"],
                printed_start=e["printed_start"],
                printed_end=end,
                section=e.get("section"),
            )
        )

    meta = {
        "rulebook": "ncert_contents_v1",
        "index_pdf_pages": pdf_pages,
        "rules_applied": [
            "Rule 1: Found Contents page",
            "Rule 2: Parsed Roman numeral entries from index",
            "Rule 3: printed_end = next chapter start − 1",
        ],
        "entries": [
            {
                "roman": c.roman,
                "title": c.title,
                "printed_start": c.printed_start,
                "printed_end": c.printed_end,
            }
            for c in chapters
        ],
    }
    return chapters, meta


def rulebook_summary() -> str:
    return __doc__ or ""
