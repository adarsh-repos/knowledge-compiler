from __future__ import annotations

import re

from backend.services.ocr import parse_pages_from_markdown

_PRINTED_WITH_HEADER = re.compile(
    r"India and the Contemporary World\s*\n(\d{1,3})\b",
    re.MULTILINE,
)
_PRINTED_WITH_BANNER = re.compile(
    r"(?:^|\n)(\d{1,3})\s*\n\s*Nationalism\s+in\s+Europe",
    re.MULTILINE,
)
_TOPIC_LINE = re.compile(r"^(\d)\s{1,}(.+)$", re.MULTILINE)
_SUBTOPIC_LINE = re.compile(r"^(\d)\.(\d+)\s+(.+)$", re.MULTILINE)

_TOPIC_PREFIXES = ("The ", "Nationalism and", "Visualising ")


def _is_valid_topic(num: str, title: str) -> bool:
    if not re.fullmatch(r"\d", num):
        return False
    if int(num) < 1 or int(num) > 9:
        return False
    title = title.strip()
    if len(title) < 12 or title.startswith("Fig."):
        return False
    if re.fullmatch(r"Nationalism\s+in\s+Europe\s*", title):
        return False
    return any(title.startswith(p) for p in _TOPIC_PREFIXES)


def detect_printed_page(page_text: str) -> int | None:
    m = _PRINTED_WITH_HEADER.search(page_text)
    if m:
        return int(m.group(1))
    m = _PRINTED_WITH_BANNER.search(page_text)
    if m:
        return int(m.group(1))
    for line in page_text.strip().splitlines()[:4]:
        line = line.strip()
        if re.fullmatch(r"\d{1,3}", line):
            n = int(line)
            if 1 <= n <= 300:
                return n
    return None


def pages_with_printed_numbers(full_text: str) -> list[dict]:
    raw = parse_pages_from_markdown(full_text)
    result: list[dict] = []
    last_printed: int | None = None
    for page in raw:
        printed = detect_printed_page(page["text"])
        if printed is None and last_printed is not None:
            printed = last_printed + 1
        if printed is not None:
            last_printed = printed
        result.append(
            {"pdf_page": page["page"], "printed_page": printed, "text": page["text"]}
        )
    return result


def extract_by_printed_range(
    full_text: str,
    printed_start: int,
    printed_end: int,
) -> tuple[str, list[dict]]:
    """
    Rule 4: extract only pages whose printed number is in [start, end].
    Returns (combined text, page list used).
    """
    pages = pages_with_printed_numbers(full_text)
    selected = [
        p
        for p in pages
        if p["printed_page"] is not None
        and printed_start <= p["printed_page"] <= printed_end
    ]

    if not selected:
        raw = parse_pages_from_markdown(full_text)
        selected = [
            {"pdf_page": p["page"], "printed_page": p["page"], "text": p["text"]}
            for p in raw
            if printed_start <= p["page"] <= printed_end
        ]

    parts = []
    for p in selected:
        parts.append(
            f"--- PDF page {p['pdf_page']} | Printed page {p['printed_page']} ---\n{p['text']}"
        )
    return "\n\n".join(parts), selected


def _printed_page_at_position(full_text: str, position: int) -> int | None:
    best: int | None = None
    for m in re.finditer(
        r"--- PDF page \d+ \| Printed page (\d+) ---",
        full_text,
    ):
        if m.start() <= position:
            best = int(m.group(1))
    return best


def parse_ncert_structure(
    chapter_text: str,
    printed_start: int,
    printed_end: int,
) -> dict:
    """
    Rules 5–6: first-occurrence topics and subtopics inside index page range.
    """
    topics_map: dict[str, dict] = {}

    # Rule 5: first occurrence of each topic number
    for m in _TOPIC_LINE.finditer(chapter_text):
        num = m.group(1)
        if num in topics_map:
            continue
        title = m.group(2).strip()
        if not _is_valid_topic(num, title):
            continue
        page = _printed_page_at_position(chapter_text, m.start())
        if page is not None and not (printed_start <= page <= printed_end):
            continue
        topics_map[num] = {
            "number": num,
            "title": title,
            "printed_page": page,
            "subtopics": [],
        }

    # Section bounds use validated topic headings only (ignore page-number lines like "5")
    topic_numbers = sorted(topics_map, key=lambda x: int(x))
    heading_positions: dict[str, int] = {}
    for m in _TOPIC_LINE.finditer(chapter_text):
        num = m.group(1)
        if num not in topics_map or num in heading_positions:
            continue
        title = m.group(2).strip()
        if title != topics_map[num]["title"]:
            continue
        page = _printed_page_at_position(chapter_text, m.start())
        if page is not None and not (printed_start <= page <= printed_end):
            continue
        heading_positions[num] = m.start()

    section_bounds: dict[str, tuple[int, int]] = {}
    for i, num in enumerate(topic_numbers):
        start_positions: list[int] = []
        if num in heading_positions:
            start_positions.append(heading_positions[num])
        sub_pat = re.compile(rf"^{num}\.(\d+)\s+(.+)$", re.MULTILINE)
        for m in sub_pat.finditer(chapter_text):
            title = m.group(2).strip()
            if len(title) < 5 or title.startswith("Fig."):
                continue
            page = _printed_page_at_position(chapter_text, m.start())
            if page is not None and not (printed_start <= page <= printed_end):
                continue
            start_positions.append(m.start())
        if not start_positions:
            continue
        start = min(start_positions)
        if i + 1 < len(topic_numbers):
            next_num = topic_numbers[i + 1]
            end = heading_positions.get(next_num, len(chapter_text))
        else:
            end = len(chapter_text)
        section_bounds[num] = (start, end)

    # Rule 6: first occurrence of each subtopic inside its topic section
    seen_sub: set[str] = set()
    for m in _SUBTOPIC_LINE.finditer(chapter_text):
        parent = m.group(1)
        sub_num = m.group(2)
        key = f"{parent}.{sub_num}"
        if key in seen_sub or parent not in topics_map:
            continue
        bounds = section_bounds.get(parent)
        if bounds is None or not (bounds[0] <= m.start() < bounds[1]):
            continue
        title = m.group(3).strip()
        if len(title) < 5 or title.startswith("Fig."):
            continue
        page = _printed_page_at_position(chapter_text, m.start())
        if page is not None and not (printed_start <= page <= printed_end):
            continue
        topics_map[parent]["subtopics"].append(
            {"number": key, "title": title, "printed_page": page}
        )
        seen_sub.add(key)

    topics = [topics_map[k] for k in sorted(topics_map, key=lambda x: int(x))]

    return {
        "printed_page_range": {"start": printed_start, "end": printed_end},
        "topic_count": len(topics),
        "topics": topics,
        "rules_applied": [
            f"Rule 4: Scanned printed pages {printed_start}–{printed_end}",
            "Rule 5: Topics = first match of 'N  Title' per number",
            "Rule 6: Subtopics = first 'N.M Title' inside topic section",
        ],
    }
