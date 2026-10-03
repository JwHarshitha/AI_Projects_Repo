#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$HOME/.local/node/bin:$PATH"

echo "=========================================================="
echo "  SentinelAI – AI Sentiment Intelligence Platform"
echo "=========================================================="

# Check Python Venv
if [ ! -d "$PROJECT_ROOT/backend/venv" ]; then
    echo "Creating Python virtual environment in backend/venv..."
    python3 -m venv "$PROJECT_ROOT/backend/venv"
    "$PROJECT_ROOT/backend/venv/bin/pip" install --upgrade pip
    "$PROJECT_ROOT/backend/venv/bin/pip" install -r "$PROJECT_ROOT/backend/requirements.txt"
fi

# Check Node Modules
if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$PROJECT_ROOT/frontend"
    npm install
fi

echo "Starting Backend API on http://127.0.0.1:8000..."
cd "$PROJECT_ROOT/backend"
./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "Starting Frontend Dev Server on http://127.0.0.1:5173..."
cd "$PROJECT_ROOT/frontend"
npx vite --host 127.0.0.1 --port 5173 &
FRONTEND_PID=$!

echo ""
echo " SentinelAI is live!"
echo "  • Web Application: http://localhost:5173"
echo "  • Backend API & Docs: http://localhost:8000/docs"
echo "  • Demo Account: demo@sentinel.ai / Sentinel@123"
echo ""
echo "Press CTRL+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
