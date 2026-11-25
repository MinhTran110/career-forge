# CareerForge 🚀
**Autonomous Multi-Agent AI Career Co-Pilot & Real-Time Job Readiness Engine**

[![CI Pipeline](https://img.shields.io/badge/CI-Passing-brightgreen?style=flat-square&logo=githubactions)](https://github.com/MinhTran110/career-forge/actions)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC2626?style=flat-square&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Google Gemini](https://img.shields.io/badge/ModelGateway-Gemini_1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 💡 Giới thiệu nhanh

**CareerForge** là nền tảng AI Đa tác nhân (Multi-Agent Swarm) mã nguồn mở hỗ trợ kỹ sư phần mềm tối ưu CV và luyện phỏng vấn kỹ thuật thực chiến:
- **Triệt tiêu ảo giác**: Đối chiếu kỹ năng với bằng chứng thật từ CV (PDF) và commit/repo GitHub trên Qdrant Vector DB.
- **Tranh luận Actor-Critic**: Agent *Resume Strategist* viết lại câu mô tả theo chuẩn Google X-Y-Z, Agent *Fact Checker* thẩm định tính xác thực.
- **Song ngữ VI / EN**: Đồng bộ ngôn ngữ thời gian thực trên toàn bộ ứng dụng.

---

## 🔑 Cơ chế Hoạt động & Cấu hình API

Dự án áp dụng mô hình **BYOK (Bring Your Own Key)**, **không cấp sẵn API key**:

| Chế độ | Cách thiết lập | Chi phí | Đặc điểm |
| :--- | :--- | :--- | :--- |
| **Dùng AI Trực tiếp** | Lấy key miễn phí tại [Google AI Studio](https://aistudio.google.com/app/apikey) rồi điền vào `backend/.env` | **0đ** (15 RPM / 1.500 RPD) | Gemini 1.5 Flash sinh câu hỏi và viết lại CV linh hoạt |
| **Chạy Ngoại tuyến (Offline)** | **Để trống** `GEMINI_API_KEY` trong file `backend/.env` | **0đ** (Không cần Internet/Key) | Tự kích hoạt Heuristic Engine nội bộ với kho 10+ câu hỏi chuẩn |

**Cấu hình tối giản (`backend/.env`):**
```env
DATABASE_URL=postgresql+asyncpg://careerforge:careerforge_secret@localhost:5434/careerforge_db
REDIS_URL=redis://localhost:6381/0
QDRANT_HOST=localhost
QDRANT_PORT=6333

# Tự điền key cá nhân (hoặc để trống để chạy Offline)
MODEL_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

---

## ✨ 3 Không gian làm việc cốt lõi

1. **🎯 Việc làm & Hồ sơ (Jobs & Radar)**:
   - Quét việc làm IT tại Việt Nam (VNG, MoMo, Viettel, FPT, Techcombank...).
   - Hỗ trợ dán tin JD tự chọn (*Custom JD Analyzer*) để trích xuất kỹ năng yêu cầu.
   - Bóc tách CV và đồng bộ bằng chứng GitHub vào Qdrant.

2. **✍️ Soạn thảo & Tối ưu CV (ATS Resume Studio)**:
   - Tối ưu câu mô tả theo công thức Google X-Y-Z: *Đạt [X], đo lường bằng [Y], bằng cách làm [Z]*.
   - So sánh Trước/Sau (Before/After) trực quan, áp dụng vào CV chỉ với 1-click.
   - Chấm điểm ATS thời gian thực, hỗ trợ Prompt Console và xuất file `.md` chuẩn A4.

3. **🎙️ Luyện phỏng vấn thực chiến (Mock Interview STAR)**:
   - Tự động sinh **4 - 10 câu hỏi** bám sát sự giao thoa giữa CV và JD.
   - Nút **"➕ Tạo thêm câu hỏi"** (chống trùng lặp) & **"✍️ Tự thêm câu hỏi"** (câu hỏi thực tế của bạn).
   - Bộ lọc danh mục (Hệ thống, Database, API, Bảo mật, Observability, CI/CD, Leadership).
   - Chấm điểm rubric thời gian thực theo 4 trụ cột **STAR** (Situation - Task - Action - Result).

---

## 🏛 Kiến trúc hệ thống

```mermaid
flowchart TD
    Client["Frontend (React 19 + TypeScript + Vite)"] <-->|REST & SSE| Gateway["FastAPI API Gateway (Port 8000)"]
    Gateway --> CoreEngine["Core Engine (ModelGateway BYOK + ToolRegistry RBAC)"]
    CoreEngine <--> Swarm["Multi-Agent Swarm (Profiler, Hunter, Strategist, Critic, Interviewer)"]
    Swarm <--> DB[("PostgreSQL 5434 | Redis 6381 | Qdrant 6333")]
```

---

## 🚀 Khởi chạy nhanh (3 bước)

### 1. Khởi động hạ tầng Docker
```bash
docker compose -f docker/docker-compose.yml up -d
```

### 2. Chạy Backend
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Chạy Frontend
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
👉 Truy cập: `http://localhost:5173` | Tài liệu API: `http://localhost:8000/docs`.

---

## 🧪 Kiểm thử tự động
```bash
# Kiểm thử Backend & Agent Engine (22 bài test)
backend/.venv/bin/pytest backend/tests/ -v

# Kiểm thử Linter
backend/.venv/bin/ruff check backend agent_engine

# Kiểm tra đóng gói Frontend
npm --prefix frontend run build
```

---

## 📄 License
Phát hành theo giấy phép mã nguồn mở [MIT License](LICENSE).
