#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env — please add your OPENAI_API_KEY"
  exit 1
fi

echo "Starting backend on :8000"
uvicorn backend.main:app --reload --port 8000
