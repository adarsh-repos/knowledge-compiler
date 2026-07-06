from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from backend.services.store import store

router = APIRouter(prefix="/api", tags=["books"])


@router.get("/books")
def list_books():
    return [b.model_dump() for b in store.list_books()]


@router.get("/books/{book_id}")
def get_book(book_id: str):
    book = store.get_book(book_id)
    if not book:
        raise HTTPException(404, "Book not found")
    return book.model_dump()


@router.post("/books/upload")
async def upload_book(
    file: UploadFile = File(...),
    title: str = Form("NCERT Class 10 History"),
    subject: str = Form("History"),
    class_level: str = Form("10"),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported")

    book = store.create_book(title, subject, class_level, file.filename)
    dest = store.book_upload_path(book.id, file.filename)

    content = await file.read()
    dest.write_bytes(content)

    return {
        "book": book.model_dump(),
        "message": "PDF uploaded. Open the book to run Step 1 (PDF Reader).",
    }
