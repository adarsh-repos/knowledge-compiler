"""
Detect NCERT cover PDF pages (before contents / chapter body).
"""

from __future__ import annotations

import re

from backend.pipeline.models import Step02LayoutResult, Step04ReadingOrderResult

_CHAPTER_MARKER_RE = re.compile(r"^Chapter\s+([IVXLC]+)\s*$", re.I)


def detect_cover_pdf_pages(
    layout: Step02LayoutResult,
    full_text: str | None = None,
    step04: Step04ReadingOrderResult | None = None,
) -> set[int]:
    """
    Cover pages = PDF pages before the contents/index spread.
    Uses reading-order scan (Contents / Chapter I) when available.
    """
    if step04 is not None:
        for block in step04.blocks:
            text = (block.text or "").strip()
            if re.search(r"\bContents\b", text, re.I) or _CHAPTER_MARKER_RE.match(text):
                if block.page > 1:
                    return set(range(1, block.page))
                break

    index_pages: set[int] = set()
    if full_text:
        from backend.services.rulebook import find_contents_pdf_pages

        index_pages = set(find_contents_pdf_pages(full_text))

    if index_pages:
        first_index = min(index_pages)
        return {p for p in range(1, first_index)}

    cover = {1}
    page2 = next((pg for pg in layout.pages if pg.page == 2), None)
    if page2:
        combined = " ".join(
            (b.text or "") for b in page2.blocks if b.type == "text" and b.text
        )
        if not re.search(r"\bContents\b", combined, re.I) and not re.search(
            r"Chapter\s+[IVXLC]+", combined, re.I
        ):
            cover.add(2)
    return cover
