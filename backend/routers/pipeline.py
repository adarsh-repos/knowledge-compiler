from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.pipeline.step01_pdf_reader import run_step01
from backend.pipeline.step02_layout_extractor import run_step02
from backend.pipeline.step03_content_block_builder import run_step03
from backend.pipeline.step04_reading_order_builder import run_step04
from backend.pipeline.step05_block_classifier import run_step05
from backend.pipeline.step06_hierarchy_builder import run_step06
from backend.pipeline.step07_paragraph_builder import run_step07
from backend.pipeline.step08_image_table_builder import run_step08
from backend.pipeline.step09_validation_engine import run_step09
from backend.pipeline.step10_canonical_json import run_step10
from backend.services.store import store

router = APIRouter(prefix="/api", tags=["pipeline"])


def _pdf_path(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    pdf_path = store.book_upload_path(book_id, book.filename)
    if not pdf_path.exists():
        raise HTTPException(404, "PDF file not found")
    return book, pdf_path


@router.post("/books/{book_id}/pipeline/step1")
def run_pdf_reader_step(book_id: str):
    """STEP 1 — PDF Reader: extract page metadata (no AI)."""
    _, pdf_path = _pdf_path(book_id)
    output_path = store.step01_output_path(book_id)
    try:
        result = run_step01(pdf_path, output_path)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc

    if not result.validation.every_page_detected or not result.validation.page_count_matches:
        raise HTTPException(
            422,
            detail={
                "message": "Step 1 validation failed",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step1")
def get_pdf_reader_step(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step01_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 1 not run yet.")
    return store.load_json(output_path)


@router.post("/books/{book_id}/pipeline/step2")
def run_layout_extraction_step(book_id: str):
    """STEP 2 — Layout Extraction: extract all visual blocks (no AI)."""
    _, pdf_path = _pdf_path(book_id)

    step1_path = store.step01_output_path(book_id)
    if not step1_path.exists():
        raise HTTPException(400, "Run Step 1 first.")

    output_path = store.step02_output_path(book_id)
    try:
        result = run_step02(pdf_path, output_path)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc

    if not result.validation.no_missing_blocks or not result.validation.coordinates_valid:
        raise HTTPException(
            422,
            detail={
                "message": "Step 2 validation failed",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step2")
def get_layout_extraction_step(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step02_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 2 not run yet.")
    return store.load_json(output_path)


@router.get("/books/{book_id}/pipeline/step2/summary")
def get_layout_summary(book_id: str):
    """Summary only — no per-page blocks (faster for UI)."""
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step02_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 2 not run yet.")
    data = store.load_json(output_path)
    return {
        "step": data.get("step", 2),
        "step_name": data.get("step_name", "layout_extraction"),
        "source": data.get("source"),
        "total_pages": data.get("total_pages"),
        "total_blocks": data.get("total_blocks"),
        "block_counts": data.get("block_counts"),
        "validation": data.get("validation"),
    }


@router.get("/books/{book_id}/pipeline/step2/pages/{page_number}")
def get_layout_page(book_id: str, page_number: int):
    """Return blocks for a single page (lighter than full step2 JSON)."""
    output_path = store.step02_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 2 not run yet.")
    data = store.load_json(output_path)
    for page in data.get("pages", []):
        if page.get("page") == page_number:
            return page
    raise HTTPException(404, f"Page {page_number} not found")


@router.post("/books/{book_id}/pipeline/step3")
def run_content_block_step(book_id: str):
    """STEP 3 — Content Block Builder: classify layout into semantic blocks (no AI)."""
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")

    step2_path = store.step02_output_path(book_id)
    if not step2_path.exists():
        raise HTTPException(400, "Run Step 2 first.")

    output_path = store.step03_output_path(book_id)
    try:
        result = run_step03(step2_path, output_path)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc

    if not result.validation.all_blocks_mapped or not result.validation.unique_block_ids:
        raise HTTPException(
            422,
            detail={
                "message": "Step 3 validation failed",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step3/summary")
def get_content_block_summary(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step03_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 3 not run yet.")
    data = store.load_json(output_path)
    return {
        "step": data.get("step", 3),
        "step_name": data.get("step_name", "content_block_builder"),
        "source": data.get("source"),
        "total_pages": data.get("total_pages"),
        "total_blocks": data.get("total_blocks"),
        "block_counts": data.get("block_counts"),
        "validation": data.get("validation"),
    }


@router.get("/books/{book_id}/pipeline/step3/pages/{page_number}")
def get_content_blocks_page(book_id: str, page_number: int):
    output_path = store.step03_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 3 not run yet.")
    data = store.load_json(output_path)
    page_blocks = [b for b in data.get("blocks", []) if b.get("page") == page_number]
    if not page_blocks:
        raise HTTPException(404, f"No content blocks on page {page_number}")
    return {"page": page_number, "blocks": page_blocks}


@router.post("/books/{book_id}/pipeline/step4")
def run_reading_order_step(book_id: str):
    """STEP 4 — Reading Order Builder: assign reading_order to every block (no AI)."""
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")

    step3_path = store.step03_output_path(book_id)
    if not step3_path.exists():
        raise HTTPException(400, "Run Step 3 first.")

    output_path = store.step04_output_path(book_id)
    try:
        result = run_step04(step3_path, output_path)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc

    if not result.validation.reading_sequence_correct or not result.validation.no_skipped_blocks:
        raise HTTPException(
            422,
            detail={
                "message": "Step 4 validation failed",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step4/summary")
def get_reading_order_summary(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step04_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 4 not run yet.")
    data = store.load_json(output_path)
    return {
        "step": data.get("step", 4),
        "step_name": data.get("step_name", "reading_order_builder"),
        "source": data.get("source"),
        "total_pages": data.get("total_pages"),
        "total_blocks": data.get("total_blocks"),
        "validation": data.get("validation"),
    }


@router.get("/books/{book_id}/pipeline/step4/pages/{page_number}")
def get_reading_order_page(book_id: str, page_number: int):
    output_path = store.step04_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 4 not run yet.")
    data = store.load_json(output_path)
    page_blocks = [b for b in data.get("blocks", []) if b.get("page") == page_number]
    if not page_blocks:
        raise HTTPException(404, f"No blocks on page {page_number}")
    page_blocks.sort(key=lambda b: b.get("page_reading_order", 0))
    return {"page": page_number, "blocks": page_blocks}


@router.post("/books/{book_id}/pipeline/step5")
def run_block_classification_step(book_id: str):
    """STEP 5 — Block Classification: assign semantic role via layout rules (no AI)."""
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")

    step04_path = store.step04_output_path(book_id)
    step02_path = store.step02_output_path(book_id)
    if not step04_path.exists():
        raise HTTPException(400, "Run Step 4 first.")
    if not step02_path.exists():
        raise HTTPException(400, "Run Step 2 first.")

    output_path = store.step05_output_path(book_id)
    try:
        result = run_step05(step04_path, step02_path, output_path)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc

    if not result.validation.all_blocks_classified:
        raise HTTPException(
            422,
            detail={
                "message": "Step 5 validation failed",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step5/summary")
def get_block_classification_summary(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step05_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 5 not run yet.")
    data = store.load_json(output_path)
    return {
        "step": data.get("step", 5),
        "step_name": data.get("step_name", "block_classification"),
        "source": data.get("source"),
        "total_pages": data.get("total_pages"),
        "total_blocks": data.get("total_blocks"),
        "role_counts": data.get("role_counts"),
        "validation": data.get("validation"),
    }


@router.get("/books/{book_id}/pipeline/step5/pages/{page_number}")
def get_classified_blocks_page(book_id: str, page_number: int):
    output_path = store.step05_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 5 not run yet.")
    data = store.load_json(output_path)
    page_blocks = [b for b in data.get("blocks", []) if b.get("page") == page_number]
    if not page_blocks:
        raise HTTPException(404, f"No blocks on page {page_number}")
    page_blocks.sort(key=lambda b: b.get("page_reading_order", 0))
    return {"page": page_number, "blocks": page_blocks}


@router.post("/books/{book_id}/pipeline/step6")
def run_hierarchy_step(book_id: str):
    """STEP 6 — Hierarchy Builder: Book → Chapter → Section → Subsection → blocks."""
    book, pdf_path = _pdf_path(book_id)

    step05_path = store.step05_output_path(book_id)
    if not step05_path.exists():
        raise HTTPException(400, "Run Step 5 first.")

    output_path = store.step06_output_path(book_id)
    try:
        result = run_step06(step05_path, pdf_path, output_path, book_title=book.title)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc

    if not result.validation.every_block_placed:
        raise HTTPException(
            422,
            detail={
                "message": "Step 6 validation failed",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step6/summary")
def get_hierarchy_summary(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step06_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 6 not run yet.")
    data = store.load_json(output_path)
    return {
        "step": data.get("step", 6),
        "step_name": data.get("step_name", "hierarchy_builder"),
        "source": data.get("source"),
        "book_title": data.get("book_title"),
        "total_blocks": data.get("total_blocks"),
        "chapter_count": len(data.get("chapters", [])),
        "validation": data.get("validation"),
    }


@router.get("/books/{book_id}/pipeline/step6/hierarchy")
def get_hierarchy_tree(book_id: str):
    output_path = store.step06_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 6 not run yet.")
    data = store.load_json(output_path)
    return {
        "book_title": data.get("book_title"),
        "chapters": data.get("chapters", []),
        "block_placements": data.get("block_placements", {}),
        "block_index": data.get("block_index", []),
        "skipped_block_ids": data.get("skipped_block_ids", []),
        "cover_page_numbers": data.get("cover_page_numbers", []),
    }


@router.post("/books/{book_id}/pipeline/step7")
def run_paragraph_step(book_id: str):
    """STEP 7 — Paragraph Builder: merge text blocks into logical paragraphs (no AI)."""
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")

    step05_path = store.step05_output_path(book_id)
    if not step05_path.exists():
        raise HTTPException(400, "Run Step 5 first.")

    output_path = store.step07_output_path(book_id)
    try:
        result = run_step07(step05_path, output_path)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc

    if not result.validation.no_incorrect_splits or not result.validation.no_incorrect_merges:
        raise HTTPException(
            422,
            detail={
                "message": "Step 7 validation failed",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step7/summary")
def get_paragraph_summary(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step07_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 7 not run yet.")
    data = store.load_json(output_path)
    return {
        "step": data.get("step", 7),
        "step_name": data.get("step_name", "paragraph_builder"),
        "source": data.get("source"),
        "total_paragraphs": data.get("total_paragraphs"),
        "source_paragraph_blocks": data.get("source_paragraph_blocks"),
        "validation": data.get("validation"),
    }


@router.get("/books/{book_id}/pipeline/step7/pages/{page_number}")
def get_paragraphs_page(book_id: str, page_number: int):
    output_path = store.step07_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 7 not run yet.")
    data = store.load_json(output_path)
    page_paragraphs = [p for p in data.get("paragraphs", []) if p.get("page") == page_number]
    return {"page": page_number, "paragraphs": page_paragraphs}


@router.post("/books/{book_id}/pipeline/step8")
def run_image_table_step(book_id: str):
    """STEP 8 — Image & Table Builder: extract images, tables, activities, glossaries."""
    book, pdf_path = _pdf_path(book_id)

    step05_path = store.step05_output_path(book_id)
    if not step05_path.exists():
        raise HTTPException(400, "Run Step 5 first.")

    output_path = store.step08_output_path(book_id)
    images_dir = store.step08_images_dir(book_id)
    try:
        result = run_step08(step05_path, pdf_path, output_path, images_dir)
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc

    v = result.validation
    if not v.caption_linked or not v.images_detected or not v.tables_preserved:
        raise HTTPException(
            422,
            detail={
                "message": "Step 8 validation failed",
                "validation": v.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step8/summary")
def get_image_table_summary(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step08_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 8 not run yet.")
    data = store.load_json(output_path)
    return {
        "step": data.get("step", 8),
        "step_name": data.get("step_name", "image_table_builder"),
        "source": data.get("source"),
        "image_count": len(data.get("images", [])),
        "figure_count": len(data.get("figures", [])),
        "table_count": len(data.get("tables", [])),
        "activity_count": len(data.get("activities", [])),
        "glossary_count": len(data.get("glossaries", [])),
        "validation": data.get("validation"),
    }


@router.get("/books/{book_id}/pipeline/step8/pages/{page_number}")
def get_image_table_page(book_id: str, page_number: int):
    output_path = store.step08_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 8 not run yet.")
    data = store.load_json(output_path)
    return {
        "page": page_number,
        "figures": [f for f in data.get("figures", []) if f.get("page") == page_number],
        "tables": [t for t in data.get("tables", []) if t.get("page") == page_number],
        "activities": [a for a in data.get("activities", []) if a.get("page") == page_number],
        "glossaries": [g for g in data.get("glossaries", []) if g.get("page") == page_number],
    }


@router.get("/books/{book_id}/pipeline/step8/images/{image_id}")
def get_extracted_image(book_id: str, image_id: str):
    images_dir = store.step08_images_dir(book_id)
    matches = list(images_dir.glob(f"{image_id}_*.png"))
    if not matches:
        raise HTTPException(404, "Image not found")
    return FileResponse(matches[0], media_type="image/png")


def _require_steps(book_id: str) -> None:
    for i in range(1, 9):
        path = getattr(store, f"step0{i}_output_path")(book_id)
        if not path.exists():
            raise HTTPException(400, f"Run Step {i} first.")


@router.post("/books/{book_id}/pipeline/step9")
def run_validation_step(book_id: str):
    """STEP 9 — Validation Engine: mandatory cross-step checks. Stops pipeline on failure."""
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")

    _require_steps(book_id)
    output_path = store.step09_output_path(book_id)
    try:
        result = run_step09(
            store.step01_output_path(book_id),
            store.step02_output_path(book_id),
            store.step03_output_path(book_id),
            store.step04_output_path(book_id),
            store.step05_output_path(book_id),
            store.step06_output_path(book_id),
            store.step07_output_path(book_id),
            store.step08_output_path(book_id),
            output_path,
        )
    except FileNotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc

    if not result.validation.passed:
        raise HTTPException(
            422,
            detail={
                "message": "Step 9 validation failed — pipeline stopped",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step9/summary")
def get_validation_summary(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step09_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 9 not run yet.")
    data = store.load_json(output_path)
    validation = data.get("validation", {})
    return {
        "step": data.get("step", 9),
        "step_name": data.get("step_name", "validation_engine"),
        "source": data.get("source"),
        "total_checks": data.get("total_checks"),
        "passed_checks": data.get("passed_checks"),
        "validation": validation,
        "checks": validation.get("checks", []),
    }


@router.post("/books/{book_id}/pipeline/step10")
def run_canonical_json_step(book_id: str):
    """STEP 10 — Clean Canonical JSON: merge all pipeline output into one structure."""
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")

    step09_path = store.step09_output_path(book_id)
    if not step09_path.exists():
        raise HTTPException(400, "Run Step 9 first.")
    step09_data = store.load_json(step09_path)
    if not step09_data.get("validation", {}).get("passed"):
        raise HTTPException(400, "Step 9 validation must pass before canonical JSON.")

    output_path = store.step10_output_path(book_id)
    try:
        result = run_step10(
            book_id=book.id,
            book_title=book.title,
            subject=book.subject,
            class_level=book.class_level,
            filename=book.filename,
            step01_path=store.step01_output_path(book_id),
            step05_path=store.step05_output_path(book_id),
            step06_path=store.step06_output_path(book_id),
            step07_path=store.step07_output_path(book_id),
            step08_path=store.step08_output_path(book_id),
            step09_path=step09_path,
            output_path=output_path,
        )
    except (FileNotFoundError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc

    if not result.validation.structure_complete:
        raise HTTPException(
            422,
            detail={
                "message": "Step 10 validation failed",
                "validation": result.validation.model_dump(),
                "result": result.model_dump(),
            },
        )
    return result.model_dump()


@router.get("/books/{book_id}/pipeline/step10/summary")
def get_canonical_summary(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    output_path = store.step10_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 10 not run yet.")
    data = store.load_json(output_path)
    return {
        "step": data.get("step", 10),
        "step_name": data.get("step_name", "canonical_json"),
        "book": data.get("book"),
        "counts": data.get("counts"),
        "validation": data.get("validation"),
    }


@router.get("/books/{book_id}/pipeline/step10/canonical")
def get_canonical_json(book_id: str):
    """Full canonical JSON for browsing."""
    output_path = store.step10_output_path(book_id)
    if not output_path.exists():
        raise HTTPException(404, "Step 10 not run yet.")
    return store.load_json(output_path)
