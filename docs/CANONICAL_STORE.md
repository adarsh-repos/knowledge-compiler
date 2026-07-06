# Canonical Content Store (System 2)

PostgreSQL-backed storage for `step10_canonical.json`. Stable IDs from extraction are used as primary keys everywhere.

## Architecture

```
step10_canonical.json
        ↓
  Canonical Loader
        ↓
   PostgreSQL
        ↓
  Repository (query API)
```

## Tables

| Table | Primary key | Parent FK |
|-------|-------------|-----------|
| `books` | `book_id` | — |
| `chapters` | `chapter_id` | `book_id` |
| `sections` (topics) | `section_id` | `book_id`, `chapter_id` |
| `subsections` (subtopics) | `subsection_id` | `book_id`, `section_id` |
| `blocks` | `block_id` | `book_id` + hierarchy columns |
| `paragraphs` | `paragraph_id` | `book_id` + hierarchy columns |
| `figures` | `figure_id` | `book_id` + hierarchy columns |
| `activities` | `activity_id` | `book_id` + hierarchy columns |
| `tables` | `table_id` | `book_id` + hierarchy columns |
| `table_cells` | `id` (auto) | `table_id` |
| `glossary_entries` | `entry_id` | `book_id` + hierarchy columns |

Reloading a book **deletes and replaces** all rows for that `book_id` (cascade).

## Setup

```bash
# 1. Start Postgres
docker compose up -d

# 2. Configure
cp .env.example .env

# 3. Install deps
pip install -r requirements.txt

# 4. Create tables
alembic upgrade head
# or: python -m backend.db.load_canonical --init-db

# 5. Run pipeline step 10, then load
python -m backend.db.load_canonical <book_id>
# or: python -m backend.db.load_canonical --all
```

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/books/{book_id}/canonical/load` | Load step10 JSON into DB |
| `GET` | `/api/books/{book_id}/canonical/status` | Check if loaded + counts |
| `GET` | `/api/books/{book_id}/canonical/chapters` | List chapters |
| `GET` | `/api/books/{book_id}/canonical/chapters/{chapter_id}/tree` | Topic/subtopic tree |
| `GET` | `/api/books/{book_id}/canonical/content?section_id=` | Paragraphs, figures, activities, tables, glossary for a scope |
| `GET` | `/api/books/{book_id}/canonical/blocks?role=&chapter_id=` | Paginated atomic blocks |
| `GET` | `/api/books/{book_id}/canonical/search?q=` | Search paragraphs |

## Example queries (SarkariExams)

```bash
# Load after pipeline
curl -X POST http://localhost:8000/api/books/{book_id}/canonical/load

# Get all content for a topic (MCQ generation scope)
curl "http://localhost:8000/api/books/{book_id}/canonical/content?chapter_id=CH_II&section_id=CH_II_TOPIC_2"

# Search paragraphs
curl "http://localhost:8000/api/books/{book_id}/canonical/search?q=Congress+of+Vienna&chapter_id=CH_I"
```

## ID stability

All IDs (`CH_I`, `P00042`, `CB000661`, `ACT00012`, `FIG00003`) come from the extraction pipeline and never change on reload. Downstream systems (MCQ bank, embeddings, user attempts) should reference these IDs.
