# Ingestion & data pipeline

PDF upload → 10-step deterministic extraction → `step10_canonical.json` → PostgreSQL.

**This folder is separate from `api/`** — ingestion is batch/offline work; the API only reads the canonical store.

## Layout

| Path | Purpose |
|------|---------|
| `ingestion/scripts/run_pipeline.py` | Run all pipeline steps for a book |
| `ingestion/scripts/load_canonical.py` | Load step10 JSON into PostgreSQL |
| `ingestion/scripts/export_db.sh` | Dump PostgreSQL for sharing |
| `backend/pipeline/` | Step 1–10 implementation (pure functions) |
| `backend/db/loader.py` | ORM loader used by scripts |
| `exports/` | Shared SQL/pg_dump files |

## Quick start

```bash
# 1. Start Postgres
docker compose up -d

# 2. Upload PDF via admin UI or API
# POST /api/books/upload

# 3. Run full pipeline
python -m ingestion.scripts.run_pipeline <book_id>

# 4. Load into DB
python -m ingestion.scripts.load_canonical <book_id>

# 5. Verify API
curl http://localhost:8000/api/courses
```

## Export / import database

```bash
# Export (after loading a book)
./ingestion/scripts/export_db.sh

# Import on another machine — see exports/README_IMPORT.md
pg_restore -h 127.0.0.1 -U knowledge -d knowledge_compiler --clean --if-exists exports/knowledge_compiler.dump
```

## Principles

- Pipeline code never imports FastAPI.
- Routers in `api/` call pipeline runners; batch jobs use `ingestion/scripts/`.
- One book registry (`data/books.json`) for uploads; PostgreSQL `books` table after canonical load.
