"""
Knowledge Compiler REST API — SarkariExams-facing HTTP service.

This package is the **read/query layer** only. PDF extraction and DB loading
live under `ingestion/`.

Run locally:
    uvicorn api.main:app --reload --port 8000

Swagger: http://localhost:8000/docs
"""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import backend.env  # noqa: F401 — load .env before other backend imports
from backend.routers import admin_db, books, canonical, courses, pipeline

ROOT = Path(__file__).resolve().parents[1]

OPENAPI_TAGS = [
    {"name": "health", "description": "Service health checks"},
    {"name": "books", "description": "Upload and manage NCERT PDF books"},
    {"name": "pipeline", "description": "Steps 1–10: PDF extraction (dev/admin triggers)"},
    {"name": "canonical", "description": "Load and query canonical content from PostgreSQL"},
    {"name": "courses", "description": "SarkariExams UI — courses, chapters, reading steps"},
    {"name": "database", "description": "Inspect PostgreSQL tables and row counts"},
]

app = FastAPI(
    title="Knowledge Compiler API",
    description="""
NCERT PDF → structured content for SarkariExams AI.

## Layout
- **`api/`** — REST endpoints consumed by the student PWA
- **`ingestion/`** — PDF pipeline, canonical JSON, DB load scripts

## Quick test
1. `GET /api/health`
2. `GET /api/courses` — subject list for Courses screen
3. `GET /api/courses/{book_id}` — chapter/topic tree for Learn screen
    """,
    version="0.3.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
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
    return {"status": "ok", "docs": "/docs", "service": "api"}


frontend_dist = ROOT / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
