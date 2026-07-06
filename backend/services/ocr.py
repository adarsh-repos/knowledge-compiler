from __future__ import annotations

import re
from pathlib import Path

import fitz  # pymupdf


def extract_text_from_pdf(pdf_path: Path) -> tuple[str, list[dict]]:
    """Extract embedded text per page — no API key required."""
    doc = fitz.open(pdf_path)
    pages: list[dict] = []
    parts: list[str] = []

    for i, page in enumerate(doc, start=1):
        text = page.get_text("text").strip()
        pages.append({"page": i, "text": text, "char_count": len(text)})
        parts.append(f"--- Page {i} ---\n{text}")

    doc.close()
    return "\n\n".join(parts), pages


def run_ocr(pdf_path: Path, output_path: Path, progress_cb=None) -> str:
    """Extract embedded PDF text. Scanned PDFs without text are not supported."""
    full_text, pages = extract_text_from_pdf(pdf_path)

    if pages:
        avg = sum(p["char_count"] for p in pages) / len(pages)
        if avg < 80:
            raise RuntimeError(
                "PDF appears scanned (little embedded text). "
                "Use a text-based PDF or add OCR separately."
            )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(full_text, encoding="utf-8")
    return full_text


def parse_pages_from_markdown(text: str) -> list[dict]:
    chunks = re.split(r"--- Page (\d+) ---", text)
    pages: list[dict] = []
    if len(chunks) <= 1:
        return [{"page": 1, "text": text}]
    for i in range(1, len(chunks), 2):
        page_num = int(chunks[i])
        page_text = chunks[i + 1].strip() if i + 1 < len(chunks) else ""
        pages.append({"page": page_num, "text": page_text})
    return pages
