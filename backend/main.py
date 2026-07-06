from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import backend.env  # noqa: F401 — load .env before other backend imports
from backend.routers import admin_db, books, canonical, courses, pipeline

ROOT = Path(__file__).resolve().parents[1]

OPENAPI_TAGS = [
    {
        "name": "health",
        "description": "Service health checks",
    },
    {
        "name": "books",
        "description": "Upload and manage NCERT PDF books",
    },
    {
        "name": "pipeline",
        "description": "Steps 1–10: PDF extraction pipeline (layout → canonical JSON)",
    },
    {
        "name": "canonical",
        "description": "**System 2** — Load and query canonical content from PostgreSQL",
    },
    {
        "name": "courses",
        "description": "**SarkariExams UI** — Course list, chapters, topics, and step-by-step reading paths",
    },
    {
        "name": "database",
        "description": "Inspect PostgreSQL tables, row counts, and preview data",
    },
]

app = FastAPI(
    title="Knowledge Compiler API",
    description="""
NCERT PDF → structured content for SarkariExams AI.

## Systems
- **System 1 (Pipeline)** — Deterministic extraction, no AI. Output: `step10_canonical.json`
- **System 2 (Canonical Store)** — PostgreSQL with stable IDs for MCQ generation

## Swagger
- **Swagger UI:** [/docs](/docs)
- **ReDoc:** [/redoc](/redoc)

## Quick test flow
1. `GET /api/health` — backend up
2. `GET /api/admin/db/health` — Postgres up
3. `GET /api/admin/db/tables` — see all tables + row counts
4. `POST /api/books/{book_id}/canonical/load` — load step10 into DB
5. `GET /api/books/{book_id}/canonical/content?section_id=CH_II_TOPIC_2` — query topic content
    """,
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router)
app.include_router(pipeline.router)
app.include_router(canonical.router)
app.include_router(courses.router)
app.include_router(admin_db.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "docs": "/docs", "redoc": "/redoc"}


# Serve built frontend in production
frontend_dist = ROOT / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
