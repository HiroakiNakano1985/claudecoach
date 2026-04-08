#!/bin/bash
set -e

echo "=== ClaudeCoach Setup ==="

# Backend
echo "[1/3] Installing Python dependencies..."
pip install -r requirements.txt

# Frontend
echo "[2/3] Installing Node.js dependencies..."
cd web && npm install && cd ..

# .env
if [ ! -f .env ]; then
  echo "[3/3] Creating .env from .env.example..."
  cp .env.example .env
else
  echo "[3/3] .env already exists, skipping."
fi

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Usage:"
echo "  1. python -m agent.cli ingest     # Ingest logs"
echo "  2. uvicorn server.main:app --port 8000  # Start backend"
echo "  3. cd web && npm run dev           # Start frontend"
echo "  4. Open http://localhost:3000"
