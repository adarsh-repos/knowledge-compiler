# Knowledge Compiler

NCERT PDF → deterministic extraction pipeline → PostgreSQL canonical store for SarkariExams AI.

## Architecture

```
PDF → Pipeline (Steps 1–10) → step10_canonical.json → PostgreSQL → API → MCQ layer
```

| System | What | Output |
|--------|------|--------|
| **System 1** | Extraction pipeline | `step10_canonical.json` |
| **System 2** | Canonical content store | PostgreSQL with stable IDs |

## Quick Start

```bash
git clone <repo-url> knowledge-compiler && cd knowledge-compiler

cp .env.example .env          # set DATABASE_URL, optional OPENAI_API_KEY
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

docker-compose up -d          # Postgres (or use local PostgreSQL)
alembic upgrade head

uvicorn backend.main:app --reload --port 8000   # → http://localhost:8000/docs
```

Frontend: `cd frontend && npm install && npm run dev` → http://localhost:5173

**Full setup guide:** [docs/SETUP.md](docs/SETUP.md)

## Swagger API docs

| URL | Description |
|-----|-------------|
| http://localhost:8000/docs | **Swagger UI** — test all endpoints |
| http://localhost:8000/redoc | ReDoc documentation |

## View database tables

```bash
# Script
./scripts/db_tables.sh

# API (Swagger → database section)
curl http://localhost:8000/api/admin/db/tables

# psql
psql postgresql://knowledge:knowledge@127.0.0.1:5432/knowledge_compiler -c '\dt'
```

## Load canonical data

After running pipeline step 10:

```bash
python -m backend.db.load_canonical <book_id>
# or POST /api/books/{book_id}/canonical/load
```

## Key API endpoints

| Method | Endpoint | UI screen |
|--------|----------|-----------|
| GET | `/api/courses` | Courses home — subject list |
| GET | `/api/courses/{book_id}` | Chapter list with topics |
| GET | `/api/courses/{book_id}/chapters/{chapter_id}/topics/{topic_id}/intro` | Topic intro (Step 1 of N) |
| GET | `/api/courses/.../topics/{topic_id}/steps` | Section-by-section reading |
| GET | `/api/courses/.../steps/{step_index}` | Next/Previous navigation |
| GET | `/api/courses/{book_id}/continue` | Continue reading card |
| GET | `/api/admin/db/tables` | List all DB tables + row counts |
| POST | `/api/books/{id}/canonical/load` | Load step10 → PostgreSQL |
| GET | `/api/books/{id}/canonical/content` | Raw topic content (paragraphs, figures…) |

## Docs

- [Setup & clone guide](docs/SETUP.md)
- [Data generation guide (new class/subject)](docs/DATA_GENERATION_GUIDE.md)
- [Canonical store schema](docs/CANONICAL_STORE.md)
