#!/usr/bin/env bash
# ==============================================================================
# ENSIA NLP Adaptive Learning System - Unified Launcher
# ==============================================================================

set -e

echo "🧠 Starting ENSIA NLP Adaptive Learning System..."

# Function to kill child processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "⚠️ Warning: Ollama does not appear to be running on http://localhost:11434"
    echo "   Please start Ollama in another terminal with: ollama serve"
fi

# 2. Start FastAPI Backend (Port 8000)
echo "🚀 Starting FastAPI Backend on http://localhost:8000..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Check if frontend dist exists
if [ -d "frontend/dist" ]; then
    echo "✨ Production UI available directly at: http://localhost:8000"
fi

# 3. If argument --dev is passed, start Vite dev server with Hot Reloading
if [ "$1" == "--dev" ]; then
    echo "⚡ Starting Vite Frontend Dev Server on http://localhost:3000..."
    cd frontend
    npm run dev &
    cd ..
    echo "🌐 Dev UI running at: http://localhost:3000"
fi

echo ""
echo "✅ System online! Press CTRL+C to stop all servers."
wait $BACKEND_PID
