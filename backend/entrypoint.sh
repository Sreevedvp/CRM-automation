#!/bin/bash
set -e

echo "Starting CRM Automation Backend Entrypoint..."

# Run database table creation and initial seed
PYTHONPATH=. python -m app.seed_admin

echo "Launching FastAPI Uvicorn Application..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
