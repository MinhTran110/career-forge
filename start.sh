#!/usr/bin/env bash
set -e

echo "🚀 [1/3] Khởi động Database & Cache Containers..."
docker compose -f docker/docker-compose.yml up -d postgres redis

echo "⏳ Đang kiểm tra kết nối PostgreSQL..."
until docker compose -f docker/docker-compose.yml exec -T postgres pg_isready -U careerforge -d careerforge_db; do
  sleep 1
done

echo "⚙️ [2/3] Khởi động FastAPI Backend Gateway (port 8000)..."
backend/.venv/bin/uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "🎨 [3/3] Khởi động React 19 Frontend Vite (port 5173)..."
npm --prefix frontend run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "✨ CareerForge đã sẵn sàng hoạt động!"
echo "👉 Frontend Web App: http://localhost:5173"
echo "👉 Backend API Docs: http://127.0.0.1:8000/docs"
echo "=========================================================="
echo "Nhấn Ctrl+C để dừng tất cả dịch vụ."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" INT TERM
wait
