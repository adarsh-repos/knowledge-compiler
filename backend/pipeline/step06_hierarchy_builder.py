"""
STEP 6 — Hierarchy Builder
==========================
Book → Chapter → Overview → Topic → Subtopic → ContentBlock

Skips front matter (contents, foreword, acknowledgements).
Overview holds chapter title + intro content until the first numbered topic.
Topics: 1, 2, 3…  Subtopics: 1.1, 1.2, 2.3…
Chapter boundaries use explicit "Chapter II" markers / chapter titles, not
printed-page jumps alone (avoids bleed from previous chapter).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import fitz

from backend.pipeline.models import (
    ClassifiedBlock,
    HierarchyBlockRef,
    HierarchyChapter,
    HierarchySection,
    HierarchySubsection,
    PlacedBlockRecord,
    Step05ClassificationResult,
    Step06HierarchyResult,
    Step06Validation,
)
from backend.services.rulebook import IndexChapter, find_contents_pdf_pages, parse_index_entries
from backend.services.structure_parser import detect_printed_page

_TOPIC_RE = re.compile(r"^(\d+)\s{1,2}(.+)$")
_SUBTOPIC_RE = re.compile(r"^(\d+\.\d+)\s+(.+)$")
_CHAPTER_MARKER_RE = re.compile(r"^Chapter\s+([IVXLC]+)\s*$", re.I)
_CHAPTER_EMBEDDED_RE = re.compile(r"Chapter\s+([IVXLC]+)", re.I)
_BOOK_SECTION_RE = re.compile(r"^Section\s+[IVXLC]+:", re.I)

OVERVIEW_NUMBER = "0"
OVERVIEW_TITLE = "Overview"


def _pdf_full_text(pdf_path: Path) -> str:
    doc = fitz.open(pdf_path)
    parts = [f"--- Page {i} ---\n{doc.load_page(i - 1).get_text('text')}" for i in range(1, doc.page_count + 1)]
    doc.close()
    return "\n\n".join(parts)


def _pdf_to_printed_map(pdf_path: Path) -> dict[int, int]:
    doc = fitz.open(pdf_path)
    mapping: dict[int, int] = {}
    last: int | None = None
    for i in range(doc.page_count):
        printed = detect_printed_page(doc.load_page(i).get_text("text"))
        if printed is None and last is not None:
            printed = last + 1
        if printed is not None:
            last = printed
        mapping[i + 1] = printed or (i + 1)
    doc.close()
    return mapping


def _normalize_title(text: str) -> str:
    cleaned = re.sub(r"chapter\s+[ivxlc]+\s*$", "", (text or "").strip(), flags=re.I)
    return re.sub(r"\s+", " ", cleaned).lower()


def _block_ref(block: ClassifiedBlock) -> HierarchyBlockRef:
    return HierarchyBlockRef(
        block_id=block.block_id,
        role=block.role,
        text=(block.text or "")[:120] or None,
    )


def _extract_chapter_roman(text: str) -> str | None:
    m = _CHAPTER_MARKER_RE.match(text.strip())
    if m:
        return m.group(1).upper()
    m = _CHAPTER_EMBEDDED_RE.search(text)
    if m:
        return m.group(1).upper()
    return None


def _is_chapter_title(text: str, chapter: HierarchyChapter) -> bool:
    norm = _normalize_title(text)
    ch_norm = _normalize_title(chapter.title)
    if not norm or not ch_norm:
        return False
    if norm == ch_norm:
        return True
    if len(ch_norm) >= 15 and ch_norm in norm:
        return True
    if len(norm) >= 15 and norm in ch_norm:
        return True
    return False


def _chapter_for_title(text: str, chapter_map: dict[int, HierarchyChapter]) -> HierarchyChapter | None:
    for ch in chapter_map.values():
        if _is_chapter_title(text, ch):
            return ch
    return None


def _parse_topic(text: str) -> tuple[str, str] | None:
    m = _TOPIC_RE.match((text or "").strip())
    if not m:
        return None
    return m.group(1), re.sub(r"\s+", " ", m.group(2).strip())


def _parse_subtopic(text: str) -> tuple[str, str] | None:
    m = _SUBTOPIC_RE.match((text or "").strip())
    if not m:
        return None
    return m.group(1), re.sub(r"\s+", " ", m.group(2).strip())


_TOC_LINE_RE = re.compile(r"^[IVXLC]+\.\s+", re.I)
_ROMAN_ONLY_RE = re.compile(r"^[ivxlc]+$", re.I)


def _is_index_page_noise(
    block: ClassifiedBlock,
    pdf_page: int,
    index_pdf_pages: list[int],
) -> bool:
    """Skip TOC/index lines on contents pages, but not real chapter content on the same spread."""
    if pdf_page not in index_pdf_pages:
        return False
    text = (block.text or "").strip()
    if block.role == "sidebar":
        return True
    if _BOOK_SECTION_RE.match(text):
        return True
    if re.match(r"^(Contents|Foreword|Preface|Introduction|Acknowledgements)\b", text, re.I):
        return True
    if _TOC_LINE_RE.match(text):
        return True
    if _ROMAN_ONLY_RE.match(text):
        return True
    return False


def _should_skip_block(
    block: ClassifiedBlock,
    pdf_page: int,
    index_pdf_pages: list[int],
    printed: int | None,
    index_chapters: list[IndexChapter],
    cover_pages: set[int] | None = None,
) -> bool:
    if block.role in ("front_matter", "cover", "map_embedded", "fragment"):
        return True
    if cover_pages and block.page in cover_pages:
        return True
    if _is_index_page_noise(block, pdf_page, index_pdf_pages):
        return True
    text = (block.text or "").strip()
    if _BOOK_SECTION_RE.match(text):
        return True
    if index_chapters and printed is not None:
        content_start = min(c.printed_start for c in index_chapters)
        if printed < content_start:
            return True
    return False


def _find_topic(chapter: HierarchyChapter, number: str) -> HierarchySection | None:
    for sec in chapter.sections:
        if sec.number == number:
            return sec
    return None


def _ensure_overview(chapter: HierarchyChapter) -> HierarchySection:
    existing = _find_topic(chapter, OVERVIEW_NUMBER)
    if existing:
        return existing
    overview = HierarchySection(
        section_id=f"CH_{chapter.roman}_TOPIC_{OVERVIEW_NUMBER}",
        number=OVERVIEW_NUMBER,
        title=OVERVIEW_TITLE,
        is_overview=True,
        blocks=[],
    )
    chapter.sections.insert(0, overview)
    return overview


def _get_or_create_topic(chapter: HierarchyChapter, number: str, title: str) -> HierarchySection:
    existing = _find_topic(chapter, number)
    if existing:
        if existing.title.startswith("Topic ") and title and not title.startswith("Topic "):
            existing.title = title
        return existing
    sec = HierarchySection(
        section_id=f"CH_{chapter.roman}_TOPIC_{number}",
        number=number,
        title=title,
        blocks=[],
    )
    chapter.sections.append(sec)
    return sec


def _find_subtopic(section: HierarchySection, number: str) -> HierarchySubsection | None:
    for sub in section.subsections:
        if sub.number == number:
            return sub
    return None


def _get_or_create_subtopic(section: HierarchySection, number: str, title: str) -> HierarchySubsection:
    existing = _find_subtopic(section, number)
    if existing:
        return existing
    sub_id = f"{section.section_id}_SUB_{number.replace('.', '_')}"
    sub = HierarchySubsection(subsection_id=sub_id, number=number, title=title, blocks=[])
    section.subsections.append(sub)
    return sub


def _sort_chapter_sections(chapter: HierarchyChapter) -> None:
    overview = [s for s in chapter.sections if s.number == OVERVIEW_NUMBER]
    topics = [s for s in chapter.sections if s.number != OVERVIEW_NUMBER]
    topics.sort(key=lambda s: int(s.number) if s.number.isdigit() else 999)
    for sec in topics:
        sec.subsections.sort(key=lambda s: s.number)
    chapter.sections = overview + topics


def _placement_path(
    chapter: HierarchyChapter,
    section: HierarchySection | None,
    subsection: HierarchySubsection | None,
) -> str:
    base = f"Chapter {chapter.roman}"
    if section is None:
        return base
    if section.number == OVERVIEW_NUMBER:
        return f"{base} > Overview"
    if subsection is None:
        return f"{base} > Section {section.number}"
    return f"{base} > Section {section.number} > {subsection.number}"


def _attach_content(
    block: ClassifiedBlock,
    ref: HierarchyBlockRef,
    chapter: HierarchyChapter,
    section: HierarchySection | None,
    subsection: HierarchySubsection | None,
    placements: dict[str, str],
    block_index: list[PlacedBlockRecord],
) -> None:
    if subsection is not None and section is not None:
        subsection.blocks.append(ref)
    elif section is not None:
        section.blocks.append(ref)
    else:
        chapter.blocks.append(ref)
    path = _placement_path(chapter, section, subsection)
    placements[block.block_id] = path
    block_index.append(
        PlacedBlockRecord(
            block_id=block.block_id,
            chapter_id=f"CH_{chapter.roman}",
            chapter_roman=chapter.roman,
            chapter_title=chapter.title,
            section_id=section.section_id if section else None,
            topic_number=section.number if section else None,
            topic_title=section.title if section else None,
            subsection_id=subsection.subsection_id if subsection else None,
            subsection_number=subsection.number if subsection else None,
            subsection_title=subsection.title if subsection else None,
            placement_path=path,
            role=block.role,
            content_type=block.type,
            page=block.page,
            reading_order=block.reading_order,
            text=(block.text or "")[:500] or None,
        )
    )


def _enter_chapter(
    chapter: HierarchyChapter,
) -> tuple[HierarchySection, None]:
    overview = _ensure_overview(chapter)
    return overview, None


def build_hierarchy(
    step05: Step05ClassificationResult,
    pdf_path: Path,
    book_title: str = "NCERT Textbook",
) -> Step06HierarchyResult:
    full_text = _pdf_full_text(pdf_path)
    index_chapters, _ = parse_index_entries(full_text)
    index_pdf_pages = find_contents_pdf_pages(full_text)
    pdf_printed = _pdf_to_printed_map(pdf_path)

    chapter_map: dict[int, HierarchyChapter] = {}
    roman_map: dict[str, HierarchyChapter] = {}
    for ic in index_chapters:
        ch = HierarchyChapter(
            number=ic.number,
            roman=ic.roman,
            title=ic.title,
            printed_start=ic.printed_start,
            printed_end=ic.printed_end,
        )
        chapter_map[ic.number] = ch
        roman_map[ic.roman.upper()] = ch

    if not chapter_map:
        ch = HierarchyChapter(
            number=1, roman="I", title=book_title, printed_start=1, printed_end=9999
        )
        chapter_map[1] = ch
        roman_map["I"] = ch

    cover_pages_list: list[int] = []
    for block in step05.blocks:
        text = (block.text or "").strip()
        if re.search(r"\bContents\b", text, re.I) or _CHAPTER_MARKER_RE.match(text):
            if block.page > 1:
                cover_pages_list = list(range(1, block.page))
            break
    if not cover_pages_list:
        cover_pages_list = [1]
    cover_page_set = set(cover_pages_list)

    placements: dict[str, str] = {}
    block_index: list[PlacedBlockRecord] = []
    skipped_ids: set[str] = set()
    skipped_front_matter = 0
    current_chapter: HierarchyChapter | None = None
    current_topic: HierarchySection | None = None
    current_subtopic: HierarchySubsection | None = None

    def switch_chapter(ch: HierarchyChapter) -> None:
        nonlocal current_chapter, current_topic, current_subtopic
        if current_chapter is None or current_chapter.number != ch.number:
            current_chapter = ch
            current_topic, current_subtopic = _enter_chapter(ch)

    for block in step05.blocks:
        printed = pdf_printed.get(block.page)

        if _should_skip_block(
            block, block.page, index_pdf_pages, printed, index_chapters, cover_page_set
        ):
            skipped_front_matter += 1
            skipped_ids.add(block.block_id)
            continue

        ref = _block_ref(block)
        text = (block.text or "").strip()

        # Explicit chapter marker — primary boundary signal
        roman = _extract_chapter_roman(text)
        if roman and roman in roman_map:
            switch_chapter(roman_map[roman])
            if _CHAPTER_MARKER_RE.match(text):
                current_topic, current_subtopic = _enter_chapter(current_chapter)
                _attach_content(
                    block, ref, current_chapter, current_topic, current_subtopic, placements, block_index
                )
                continue

        # First chapter assignment (before any marker seen)
        if current_chapter is None and index_chapters:
            for ic in index_chapters:
                if ic.printed_start <= (printed or 0) <= ic.printed_end:
                    switch_chapter(chapter_map[ic.number])
                    break
            if current_chapter is None:
                switch_chapter(chapter_map[min(chapter_map.keys())])

        if current_chapter is None:
            switch_chapter(chapter_map[min(chapter_map.keys())])

        # Chapter title — may also switch chapter (e.g. "Indo-ChinaChapter II")
        title_chapter = _chapter_for_title(text, chapter_map)
        if title_chapter is not None and (
            block.role == "chapter_title" or block.type == "heading"
        ):
            switch_chapter(title_chapter)
            if current_topic is None or current_topic.number != OVERVIEW_NUMBER:
                current_topic, current_subtopic = _enter_chapter(current_chapter)
            _attach_content(
                block, ref, current_chapter, current_topic, current_subtopic, placements, block_index
            )
            continue

        # Misclassified map labels — content only
        if block.role == "chapter":
            if current_topic is None:
                current_topic, current_subtopic = _enter_chapter(current_chapter)
            _attach_content(
                block, ref, current_chapter, current_topic, current_subtopic, placements, block_index
            )
            continue

        # Topic heading (e.g. "1  Emerging from the Shadow of China")
        topic_parsed = _parse_topic(text)
        if topic_parsed and block.role == "section":
            num, title = topic_parsed
            current_topic = _get_or_create_topic(current_chapter, num, title)
            current_subtopic = None
            _attach_content(
                block, ref, current_chapter, current_topic, current_subtopic, placements, block_index
            )
            continue

        # Subtopic heading (e.g. "1.1 Colonial Domination and Resistance")
        sub_parsed = _parse_subtopic(text)
        if sub_parsed and block.role == "subsection":
            num, title = sub_parsed
            parent_num = num.split(".")[0]
            current_topic = _get_or_create_topic(
                current_chapter, parent_num, f"Topic {parent_num}"
            )
            current_subtopic = _get_or_create_subtopic(current_topic, num, title)
            _attach_content(
                block, ref, current_chapter, current_topic, current_subtopic, placements, block_index
            )
            continue

        # Fallback section/subsection roles
        if block.role == "section":
            num = str(len([s for s in current_chapter.sections if s.number != OVERVIEW_NUMBER]) + 1)
            current_topic = _get_or_create_topic(current_chapter, num, text)
            current_subtopic = None
            _attach_content(
                block, ref, current_chapter, current_topic, current_subtopic, placements, block_index
            )
            continue

        if block.role == "subsection":
            real_topics = [s for s in current_chapter.sections if s.number != OVERVIEW_NUMBER]
            parent_num = real_topics[-1].number if real_topics else "1"
            current_topic = _get_or_create_topic(current_chapter, parent_num, f"Topic {parent_num}")
            num = f"{parent_num}.{len(current_topic.subsections) + 1}"
            current_subtopic = _get_or_create_subtopic(current_topic, num, text)
            _attach_content(
                block, ref, current_chapter, current_topic, current_subtopic, placements, block_index
            )
            continue

        # Default: attach to overview if no topic yet
        if current_topic is None:
            current_topic, current_subtopic = _enter_chapter(current_chapter)

        _attach_content(
            block, ref, current_chapter, current_topic, current_subtopic, placements, block_index
        )

    for ch in chapter_map.values():
        _sort_chapter_sections(ch)
        if not _find_topic(ch, OVERVIEW_NUMBER) and (ch.blocks or ch.sections):
            _ensure_overview(ch)

    chapters = [chapter_map[k] for k in sorted(chapter_map.keys())]
    all_ids = {b.block_id for b in step05.blocks}
    placed_ids = set(placements.keys())
    missing = all_ids - placed_ids - skipped_ids

    errors: list[str] = []
    if missing:
        errors.append(f"Unplaced blocks: {len(missing)} (skipped front matter: {skipped_front_matter})")

    return Step06HierarchyResult(
        source=step05.source,
        book_title=book_title,
        chapters=chapters,
        block_placements=placements,
        block_index=block_index,
        skipped_block_ids=sorted(skipped_ids),
        cover_page_numbers=cover_pages_list,
        total_blocks=len(step05.blocks),
        validation=Step06Validation(
            every_block_placed=not missing,
            errors=errors,
        ),
    )


def run_step06(
    step05_path: Path,
    pdf_path: Path,
    output_path: Path | None = None,
    book_title: str = "NCERT Textbook",
) -> Step06HierarchyResult:
    step05 = Step05ClassificationResult(**json.loads(step05_path.read_text(encoding="utf-8")))
    result = build_hierarchy(step05, pdf_path, book_title)
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result
