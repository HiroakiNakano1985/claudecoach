#!/bin/bash
set -e

echo ""
echo "=== Starting ClaudeCoach ==="
echo ""

# Ingest latest logs
echo "[1/3] Ingesting Claude Code logs..."
python -m agent.cli ingest

# Start backend
echo "[2/3] Starting backend (port 8000)..."
uvicorn server.main:app --port 8000 &
BACKEND_PID=$!
sleep 2

# Start frontend
echo "[3/3] Starting frontend (port 3000)..."
cd web && npm run dev &
FRONTEND_PID=$!
cd ..
sleep 3

echo ""
echo "============================================"
echo "  ClaudeCoach is running!"
echo "============================================"
echo ""
echo "  Dashboard:  http://localhost:3000"
echo "  API:        http://localhost:8000/api/health"
echo ""
echo "  Press Ctrl+C to stop all services."
echo ""

# Open browser
if command -v open &> /dev/null; then
  open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:3000
fi

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
