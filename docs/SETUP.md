# Setup Guide — Clone to Production

Complete steps for a new developer cloning this repo.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.9+ (3.11 recommended) | Backend |
| Node.js | 18+ | Frontend |
| PostgreSQL | 14+ | Canonical content store |
| Docker | optional | Postgres via `docker-compose` |

---

## 1. Clone the repository

```bash
git clone <your-repo-url> knowledge-compiler
cd knowledge-compiler
```

---

## 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=sk-...                    # optional for pipeline AI steps
DATABASE_URL=postgresql+psycopg2://knowledge:knowledge@127.0.0.1:5432/knowledge_compiler
```

---

## 3. PostgreSQL

### Option A — Docker (recommended)

```bash
docker-compose up -d
```

Default credentials: `knowledge` / `knowledge` / database `knowledge_compiler`

### Option B — Local Homebrew (macOS)

```bash
brew install postgresql@14
brew services start postgresql@14
createdb knowledge_compiler   # or use psql to create user/db
```

Update `DATABASE_URL` in `.env` to match your local user.

---

## 4. Backend setup

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create database tables
alembic upgrade head
```

Start the API:

```bash
uvicorn backend.main:app --reload --port 8000
```

**Swagger UI (test all endpoints):** http://localhost:8000/docs

---

## 5. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 6. Run the extraction pipeline

1. Upload a PDF via UI or `POST /api/books/upload`
2. Run pipeline steps 1–10 in the UI (or via API)
3. Step 10 produces `pipeline_output/{book_id}/step10_canonical.json`

---

## 7. Load canonical data into PostgreSQL (System 2)

```bash
# CLI
python -m backend.db.load_canonical <book_id>

# Or via Swagger / curl
curl -X POST http://localhost:8000/api/books/<book_id>/canonical/load
```

Verify:

```bash
./scripts/db_tables.sh
# or
curl http://localhost:8000/api/admin/db/tables
```

---

## 8. View the database

### Swagger (easiest)

Open http://localhost:8000/docs → **database** section:

| Endpoint | What it shows |
|----------|---------------|
| `GET /api/admin/db/health` | Postgres connection |
| `GET /api/admin/db/tables` | All tables + row counts |
| `GET /api/admin/db/books` | Loaded books |
| `GET /api/admin/db/preview/{table}` | Sample rows |

### psql (terminal)

```bash
psql postgresql://knowledge:knowledge@127.0.0.1:5432/knowledge_compiler

\dt                          -- list tables
SELECT COUNT(*) FROM blocks;
SELECT * FROM chapters LIMIT 5;
```

### GUI tools

- [TablePlus](https://tableplus.com/) — connect with `DATABASE_URL` credentials
- [pgAdmin](https://www.pgadmin.org/)
- VS Code extension: **PostgreSQL** by Chris Kolkman

---

## 9. Query content via API (for SarkariExams)

```bash
BOOK=3e0531a5-e7c1-4995-bdb3-979ad5ef4983

# Status
curl http://localhost:8000/api/books/$BOOK/canonical/status

# Chapter tree
curl http://localhost:8000/api/books/$BOOK/canonical/chapters/CH_II/tree

# All content for a topic (paragraphs, figures, activities, glossary)
curl "http://localhost:8000/api/books/$BOOK/canonical/content?chapter_id=CH_II&section_id=CH_II_TOPIC_2"

# Search paragraphs
curl "http://localhost:8000/api/books/$BOOK/canonical/search?q=Congress+of+Vienna"
```

---

## Database schema

```
books
 ├── chapters
 │    ├── sections          (topics)
 │    │    └── subsections  (subtopics)
 │    └── content:
 │         ├── blocks       (atomic, block_id)
 │         ├── paragraphs   (paragraph_id)
 │         ├── figures      (figure_id)
 │         ├── activities   (activity_id)
 │         ├── tables       (table_id) → table_cells
 │         └── glossary_entries
```

All IDs are stable strings from the extraction pipeline (`CH_I`, `P00042`, `CB000661`).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker compose` fails | Use `docker-compose up -d` (with hyphen) |
| Docker daemon not running | Start Docker Desktop, or use local Postgres |
| `role does not exist` | Create Postgres user matching `DATABASE_URL` |
| Python 3.9 type errors | `pip install eval_type_backport` (in requirements.txt) |
| `step10 not found` | Run pipeline step 10 first |
| Empty tables | Run `POST /canonical/load` or CLI loader |

---

## Project structure

```
backend/
  pipeline/          # Steps 1–10 extraction
  db/                # PostgreSQL models, loader, repository
  routers/           # FastAPI routes (pipeline, canonical, admin_db)
pipeline_output/     # Per-book JSON (step01…step10)
uploads/             # PDF files
frontend/            # React UI
alembic/             # Database migrations
docs/                # Documentation
scripts/             # Helper scripts
```
