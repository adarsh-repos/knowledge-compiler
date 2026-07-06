from pathlib import Path

import pytest

from backend.pipeline.step01_pdf_reader import read_pdf, run_step01

NCERT_PDF = Path(
    "uploads/42ba1dd1-b074-4c22-a397-d7f6c1f78c4a/NCERT-Class-10-History.pdf"
)


@pytest.mark.skipif(not NCERT_PDF.exists(), reason="NCERT sample PDF not available")
def test_read_pdf_extracts_all_pages():
    result = read_pdf(NCERT_PDF)

    assert result.step == 1
    assert result.step_name == "pdf_reader"
    assert result.total_pages > 0
    assert len(result.pages) == result.total_pages
    assert result.validation.every_page_detected is True
    assert result.validation.page_count_matches is True
    assert result.validation.errors == []

    assert result.pages[0].page == 1
    assert result.pages[0].width > 0
    assert result.pages[0].height > 0
    assert result.pages[0].rotation in (0, 90, 180, 270)

    assert result.pages[-1].page == result.total_pages


@pytest.mark.skipif(not NCERT_PDF.exists(), reason="NCERT sample PDF not available")
def test_run_step01_writes_json(tmp_path):
    out = tmp_path / "step01_pdf_reader.json"
    result = run_step01(NCERT_PDF, out)

    assert out.exists()
    assert result.total_pages == len(result.pages)
    saved = out.read_text(encoding="utf-8")
    assert '"step_name": "pdf_reader"' in saved
