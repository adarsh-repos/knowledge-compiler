#!/usr/bin/env bash
# Export PostgreSQL canonical store for sharing.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/exports/knowledge_compiler.dump"
mkdir -p "$ROOT/exports"
pg_dump -h 127.0.0.1 -U knowledge -Fc knowledge_compiler -f "$OUT"
echo "Exported → $OUT"
