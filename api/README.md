# REST API — SarkariExams-facing HTTP service

Serves `/api/courses`, `/api/canonical`, health checks, and admin DB inspection.

```bash
uvicorn api.main:app --reload --port 8000
```

Pipeline triggers (`/api/books/{id}/pipeline/...`) are mounted here for the admin UI but implemented in `backend/pipeline/`.

See also: `ingestion/README.md` for offline batch jobs.
