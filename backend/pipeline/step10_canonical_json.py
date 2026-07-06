"""
STEP 10 — Clean Canonical JSON
================================
Merge validated pipeline output into one canonical structure.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from backend.pipeline.models import (
    CanonicalActivity,
    CanonicalBlock,
    CanonicalBook,
    CanonicalChapter,
    CanonicalFigure,
    CanonicalGlossaryEntry,
    CanonicalParagraph,
    CanonicalSection,
    CanonicalSubsection,
    CanonicalTable,
    CanonicalTableCell,
    Step01PdfReaderResult,
    Step05ClassificationResult,
    Step06HierarchyResult,
    Step07ParagraphResult,
    Step08ImageTableResult,
    Step09ValidationResult,
    Step10CanonicalResult,
    Step10Validation,
)

_CHAPTER_RE = re.compile(r"Chapter\s+([IVXLC]+)", re.I)
_SECTION_RE = re.compile(r"Section\s+([\d.]+)", re.I)
_OVERVIEW_RE = re.compile(r"Overview", re.I)

OVERVIEW_NUMBER = "0"


def _parse_placement(path: str) -> tuple[str | None, str | None, str | None]:
    chapter_id: str | None = None
    section_num: str | None = None
    subsection_num: str | None = None
    ch_m = _CHAPTER_RE.search(path)
    if ch_m:
        chapter_id = f"CH_{ch_m.group(1).upper()}"
    if _OVERVIEW_RE.search(path):
        section_num = OVERVIEW_NUMBER
    else:
        sec_m = _SECTION_RE.search(path)
        if sec_m:
            section_num = sec_m.group(1).replace(".", "_")
            parts = path.split(" > ")
            if len(parts) >= 3:
                subsection_num = parts[-1].strip()
    return chapter_id, section_num, subsection_num


class _HierarchyMaps:
    def __init__(self) -> None:
        self.block_chapter: dict[str, str] = {}
        self.block_section: dict[str, str] = {}
        self.block_subsection: dict[str, str] = {}
        self.section_map: dict[str, CanonicalSection] = {}
        self.subsection_map: dict[str, CanonicalSubsection] = {}
        self.section_by_chapter_num: dict[tuple[str, str], str] = {}
        self.subsection_by_nums: dict[tuple[str, str, str], str] = {}


def _build_hierarchy_maps(step06: Step06HierarchyResult) -> _HierarchyMaps:
    maps = _HierarchyMaps()

    for ch in step06.chapters:
        chapter_id = f"CH_{ch.roman}"
        for sec_idx, sec in enumerate(ch.sections, start=1):
            section_id = sec.section_id or f"{chapter_id}_SEC_{sec_idx:03d}"
            is_overview = sec.is_overview or sec.number == OVERVIEW_NUMBER
            sec_obj = CanonicalSection(
                section_id=section_id,
                chapter_id=chapter_id,
                number=sec.number,
                title=sec.title,
                is_overview=is_overview,
            )
            maps.section_map[section_id] = sec_obj
            maps.section_by_chapter_num[(chapter_id, sec.number)] = section_id

            for ref in sec.blocks:
                maps.block_chapter[ref.block_id] = chapter_id
                maps.block_section[ref.block_id] = section_id

            for sub_idx, sub in enumerate(sec.subsections, start=1):
                subsection_id = sub.subsection_id or f"{section_id}_SUB_{sub_idx:03d}"
                sub_obj = CanonicalSubsection(
                    subsection_id=subsection_id,
                    section_id=section_id,
                    chapter_id=chapter_id,
                    number=sub.number,
                    title=sub.title,
                )
                maps.subsection_map[subsection_id] = sub_obj
                sec_obj.subsection_ids.append(subsection_id)
                maps.subsection_by_nums[(chapter_id, sec.number, sub.number)] = subsection_id

                for ref in sub.blocks:
                    maps.block_chapter[ref.block_id] = chapter_id
                    maps.block_section[ref.block_id] = section_id
                    maps.block_subsection[ref.block_id] = subsection_id

        for ref in ch.blocks:
            maps.block_chapter[ref.block_id] = chapter_id

    return maps


def _lookup_block(
    block_ids: list[str],
    maps: _HierarchyMaps,
    placements: dict[str, str],
) -> tuple[str | None, str | None, str | None]:
    for bid in block_ids:
        if bid in maps.block_subsection:
            return (
                maps.block_chapter.get(bid),
                maps.block_section.get(bid),
                maps.block_subsection[bid],
            )
    for bid in block_ids:
        if bid in maps.block_section:
            return maps.block_chapter.get(bid), maps.block_section[bid], None
    for bid in block_ids:
        if bid in maps.block_chapter:
            return maps.block_chapter[bid], None, None
    for bid in block_ids:
        path = placements.get(bid, "")
        if path:
            ch_id, sec_num, sub_num = _parse_placement(path)
            sec_id = (
                maps.section_by_chapter_num.get((ch_id, sec_num))
                if ch_id and sec_num
                else None
            )
            sub_id = (
                maps.subsection_by_nums.get((ch_id, sec_num, sub_num))
                if ch_id and sec_num and sub_num
                else None
            )
            return ch_id, sec_id, sub_id
    return None, None, None


def _lookup_single_block(
    block_id: str,
    maps: _HierarchyMaps,
    placements: dict[str, str],
) -> tuple[str | None, str | None, str | None]:
    return _lookup_block([block_id], maps, placements)


def _build_canonical_blocks(
    book_id: str,
    step05: Step05ClassificationResult,
    step06: Step06HierarchyResult,
) -> list[CanonicalBlock]:
    source_blocks = {b.block_id: b for b in step05.blocks}
    canonical: list[CanonicalBlock] = []
    for rec in step06.block_index:
        src = source_blocks.get(rec.block_id)
        canonical.append(
            CanonicalBlock(
                block_id=rec.block_id,
                book_id=book_id,
                chapter_id=rec.chapter_id,
                chapter_roman=rec.chapter_roman,
                chapter_title=rec.chapter_title,
                section_id=rec.section_id,
                topic_number=rec.topic_number,
                topic_title=rec.topic_title,
                subsection_id=rec.subsection_id,
                subsection_number=rec.subsection_number,
                subsection_title=rec.subsection_title,
                placement_path=rec.placement_path,
                role=rec.role,
                content_type=rec.content_type,
                page=rec.page,
                reading_order=rec.reading_order,
                text=src.text if src else rec.text,
                font=src.font if src else None,
                font_size=src.font_size if src else None,
                bold=src.bold if src else None,
                italic=src.italic if src else None,
                coordinates=src.coordinates if src else None,
            )
        )
    return canonical


def build_canonical_json(
    book_id: str,
    book_title: str,
    subject: str,
    class_level: str,
    filename: str,
    step01: Step01PdfReaderResult,
    step05: Step05ClassificationResult,
    step06: Step06HierarchyResult,
    step07: Step07ParagraphResult,
    step08: Step08ImageTableResult,
    step09: Step09ValidationResult | None = None,
) -> Step10CanonicalResult:
    if step09 and not step09.validation.passed:
        raise ValueError("Step 9 validation must pass before building canonical JSON")

    book = CanonicalBook(
        book_id=book_id,
        title=book_title,
        subject=subject,
        class_level=class_level,
        filename=filename,
        total_pages=step01.total_pages,
    )

    placements = step06.block_placements
    maps = _build_hierarchy_maps(step06)
    canonical_blocks = _build_canonical_blocks(book_id, step05, step06)

    chapters: list[CanonicalChapter] = []
    sections: list[CanonicalSection] = []
    subsections: list[CanonicalSubsection] = list(maps.subsection_map.values())

    for ch in step06.chapters:
        chapter_id = f"CH_{ch.roman}"
        section_ids = [
            (sec.section_id or f"{chapter_id}_SEC_{idx:03d}")
            for idx, sec in enumerate(ch.sections, start=1)
        ]
        sections.extend(maps.section_map[sid] for sid in section_ids if sid in maps.section_map)
        chapters.append(
            CanonicalChapter(
                chapter_id=chapter_id,
                number=ch.number,
                roman=ch.roman,
                title=ch.title,
                printed_start=ch.printed_start,
                printed_end=ch.printed_end,
                section_ids=section_ids,
            )
        )

    paragraphs: list[CanonicalParagraph] = []
    for i, p in enumerate(step07.paragraphs, start=1):
        chapter_id, section_id, subsection_id = _lookup_block(
            p.source_block_ids, maps, placements
        )
        para = CanonicalParagraph(
            paragraph_id=p.paragraph_id,
            book_id=book_id,
            chapter_id=chapter_id,
            section_id=section_id,
            subsection_id=subsection_id,
            order=i,
            text=p.text,
            page=p.page,
            source_block_ids=p.source_block_ids,
        )
        paragraphs.append(para)
        if subsection_id and subsection_id in maps.subsection_map:
            maps.subsection_map[subsection_id].paragraph_ids.append(p.paragraph_id)
        elif section_id and section_id in maps.section_map:
            maps.section_map[section_id].paragraph_ids.append(p.paragraph_id)
        elif chapter_id:
            for ch in chapters:
                if ch.chapter_id == chapter_id:
                    ch.paragraph_ids.append(p.paragraph_id)
                    break

    figures: list[CanonicalFigure] = []
    for f in step08.figures:
        chapter_id, section_id, subsection_id = _lookup_single_block(
            f.block_id, maps, placements
        )
        figures.append(
            CanonicalFigure(
                figure_id=f.figure_id,
                book_id=book_id,
                chapter_id=chapter_id,
                section_id=section_id,
                subsection_id=subsection_id,
                page=f.page,
                image_id=f.image_id,
                caption=f.caption,
                block_id=f.block_id,
            )
        )

    activities: list[CanonicalActivity] = []
    for a in step08.activities:
        chapter_id, section_id, subsection_id = _lookup_single_block(
            a.block_id, maps, placements
        )
        activities.append(
            CanonicalActivity(
                activity_id=a.activity_id,
                book_id=book_id,
                chapter_id=chapter_id,
                section_id=section_id,
                subsection_id=subsection_id,
                page=a.page,
                title=a.title,
                body=a.body,
                activity_type=a.activity_type,
                source_block_ids=a.source_block_ids,
                block_id=a.block_id,
            )
        )

    tables: list[CanonicalTable] = []
    for t in step08.tables:
        chapter_id, section_id, subsection_id = _lookup_single_block(
            t.block_id, maps, placements
        )
        tables.append(
            CanonicalTable(
                table_id=t.table_id,
                book_id=book_id,
                chapter_id=chapter_id,
                section_id=section_id,
                subsection_id=subsection_id,
                page=t.page,
                rows=t.rows,
                columns=t.columns,
                cells=[CanonicalTableCell(row=c.row, col=c.col, text=c.text) for c in t.cells],
                block_id=t.block_id,
            )
        )

    glossary: list[CanonicalGlossaryEntry] = []
    for g in step08.glossaries:
        chapter_id, section_id, subsection_id = _lookup_single_block(
            g.block_id, maps, placements
        )
        for entry in g.entries:
            glossary.append(
                CanonicalGlossaryEntry(
                    glossary_id=g.glossary_id,
                    book_id=book_id,
                    chapter_id=chapter_id,
                    section_id=section_id,
                    subsection_id=subsection_id,
                    page=g.page,
                    word=entry.word,
                    meaning=entry.meaning,
                    block_id=g.block_id,
                )
            )

    counts = {
        "chapters": len(chapters),
        "sections": len(sections),
        "subsections": len(subsections),
        "blocks": len(canonical_blocks),
        "paragraphs": len(paragraphs),
        "figures": len(figures),
        "activities": len(activities),
        "tables": len(tables),
        "glossary": len(glossary),
    }

    errors: list[str] = []
    if not paragraphs:
        errors.append("No paragraphs in canonical output")
    if counts["chapters"] == 0:
        errors.append("No chapters in canonical output")

    return Step10CanonicalResult(
        book=book,
        chapters=chapters,
        sections=sections,
        subsections=subsections,
        blocks=canonical_blocks,
        paragraphs=paragraphs,
        figures=figures,
        activities=activities,
        tables=tables,
        glossary=glossary,
        counts=counts,
        validation=Step10Validation(
            structure_complete=not errors,
            errors=errors,
        ),
    )


def run_step10(
    book_id: str,
    book_title: str,
    subject: str,
    class_level: str,
    filename: str,
    step01_path: Path,
    step05_path: Path,
    step06_path: Path,
    step07_path: Path,
    step08_path: Path,
    step09_path: Path | None = None,
    output_path: Path | None = None,
) -> Step10CanonicalResult:
    step01 = Step01PdfReaderResult(**json.loads(step01_path.read_text(encoding="utf-8")))
    step05 = Step05ClassificationResult(**json.loads(step05_path.read_text(encoding="utf-8")))
    step06 = Step06HierarchyResult(**json.loads(step06_path.read_text(encoding="utf-8")))
    step07 = Step07ParagraphResult(**json.loads(step07_path.read_text(encoding="utf-8")))
    step08 = Step08ImageTableResult(**json.loads(step08_path.read_text(encoding="utf-8")))
    step09 = None
    if step09_path and step09_path.exists():
        step09 = Step09ValidationResult(**json.loads(step09_path.read_text(encoding="utf-8")))

    result = build_canonical_json(
        book_id, book_title, subject, class_level, filename,
        step01, step05, step06, step07, step08, step09,
    )
    if output_path is not None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")
    return result
