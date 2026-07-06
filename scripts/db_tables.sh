#!/usr/bin/env bash
# List all PostgreSQL tables and row counts for the canonical store.
set -e
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

URL="${DATABASE_URL:-postgresql+psycopg2://knowledge:knowledge@127.0.0.1:5432/knowledge_compiler}"
# Strip SQLAlchemy driver prefix for psql
PSQL_URL="${URL/postgresql+psycopg2/postgresql}"
PSQL_URL="${PSQL_URL/postgresql+psycopg/postgresql}"

echo "Database: ${PSQL_URL##*@}"
echo ""
psql "$PSQL_URL" -c "
SELECT c.relname AS table_name,
       COALESCE(s.n_live_tup, 0)::bigint AS rows
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
"
