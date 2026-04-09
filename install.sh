#!/bin/bash
set -e

echo ""
echo "=== ClaudeCoach Installer ==="
echo ""

# Clone if not already in the repo
if [ ! -f "pyproject.toml" ]; then
  git clone https://github.com/HiroakiNakano1985/claudecoach.git
  cd claudecoach
fi

# Python dependencies
echo "[1/3] Installing Python dependencies..."
pip install -r requirements.txt -q

# Node.js dependencies
echo "[2/3] Installing Node.js dependencies..."
cd web && npm install --silent && cd ..

# .env
if [ ! -f .env ]; then
  echo "[3/3] Creating .env..."
  cp .env.example .env
else
  echo "[3/3] .env already exists, skipping."
fi

echo ""
echo "============================================"
echo "  ClaudeCoach installed successfully!"
echo "============================================"
echo ""
echo "  To start:"
echo "    cd claudecoach"
echo "    bash start.sh"
echo ""
echo "  Or manually:"
echo "    python -m agent.cli ingest"
echo "    uvicorn server.main:app --port 8000 &"
echo "    cd web && npm run dev &"
echo "    open http://localhost:3000"
echo ""
