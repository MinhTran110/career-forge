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

## 💡 Tổng quan (Overview)

**CareerForge** là nền tảng AI Đa tác nhân (Autonomous Multi-Agent Swarm) mã nguồn mở, được thiết kế chuyên biệt để tăng tốc sự nghiệp và nâng cao khả năng trúng tuyển cho kỹ sư phần mềm. Khác với các công cụ tạo CV tĩnh hoặc giao diện wrapper LLM thông thường, CareerForge tích hợp:
- **Hồ sơ bằng chứng thật (Ground-Truth Evidence Lake)**: Trích xuất trực tiếp từ CV thực tế (PDF/Scan) và lịch sử commit/repository GitHub trên Qdrant Vector DB để triệt tiêu hoàn toàn ảo giác (Anti-Hallucination).
- **Vòng lặp Đa tác nhân Actor-Critic**: Agent **Resume Strategist** tạo câu mô tả chuẩn công thức định lượng Google X-Y-Z, trong khi Agent **Fact Checker Critic** kiểm định từng số liệu và kỹ năng đối chiếu với bằng chứng thật.
- **Mô hình cấu hình API linh hoạt (BYOK - Bring Your Own Key)**: Không phụ thuộc vào API máy chủ trả phí; người dùng tự cấu hình API Key cá nhân miễn phí (Google AI Studio Gemini) trong `.env`, hoặc chạy hoàn toàn độc lập với bộ suy luận ngoại tuyến (Offline Heuristic Engine).
- **Trải nghiệm song ngữ đồng bộ (100% Bilingual VI / EN)**: Chuyển đổi ngôn ngữ thời gian thực trên toàn bộ ứng dụng, đồng bộ cả nội dung CV, các gợi ý trước/sau và phòng luyện phỏng vấn.

---

## 🏛 Kiến trúc hệ thống (System Architecture)

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + TypeScript + Vite)"]
        UI_Radar["🎯 Workspace 1: Việc làm & Hồ sơ (Vietnam Tech Jobs & Custom JD)"]
        UI_Editor["✍️ Workspace 2: ATS Resume Studio (Google X-Y-Z Diff & Live Score)"]
        UI_Interview["🎙️ Workspace 3: Luyện phỏng vấn STAR (Custom & Expanded Questions)"]
        UI_Lang["🌐 Đồng bộ Đa ngữ (Bilingual VI / EN Synchronization)"]
    end

    subgraph Gateway["FastAPI API Gateway (Port 8000)"]
        Auth["JWT Auth Interceptor"]
        AppEndpoints["/api/v1/applications/tailor & /prompt-tailor"]
        RadarEndpoints["/api/v1/radar/jobs & /analyze-custom-jd"]
        ProfileEndpoints["/api/v1/profile/setup & /me"]
        InterviewEndpoints["/api/v1/interviews/generate-questions-from-cv & /answer"]
    end

    subgraph CoreEngine["Agent Engine Core (agent_engine/core/)"]
        ModelGW["ModelGateway<br/>(Gemini 1.5 Flash BYOK / OpenAI / Offline Heuristic Engine)"]
        ToolReg["ToolRegistry & RBAC<br/>(Least-Privilege Scope Enforcement)"]
        EventBus["AgentEventBus<br/>(Async Pub/Sub + Replay Buffer)"]
    end

    subgraph Swarm["Multi-Agent Swarm (agent_engine/agents/)"]
        CP["Candidate Profiler"]
        MH["Market Hunter"]
        SS["Skill Strategist"]
        RS["Resume Strategist (Actor)"]
        FC["Fact Checker (Critic - Strict Read-Only)"]
        SI["STAR Interviewer (10+ Domain Questions & Rubric Scoring)"]
    end

    subgraph DataStore["Data & Persistence Layer"]
        PG[("PostgreSQL 16 (Port 5434)")]
        Redis[("Redis 7 (Port 6381)")]
        Qdrant[("Qdrant Vector DB (Port 6333)")]
        MinIO[("MinIO S3 (Port 9000)")]
    end

    Client <-->|REST & SSE| Gateway
    Gateway --> CoreEngine
    CoreEngine <--> Swarm
    Swarm -->|Vector Grounding| Qdrant
    Swarm -->|Metadata & Auth| PG
    Swarm -->|Stream Replay| EventBus
    Swarm -->|LLM Synthesis| ModelGW
    Swarm -->|RBAC Tool Invocations| ToolReg
```

---

## 🔑 Cơ chế Cấu hình API & Chế độ Ngoại tuyến (API Key & Offline Mode)

> [!IMPORTANT]
> **Dự án CareerForge KHÔNG cung cấp sẵn API Key trả phí và KHÔNG phân phối hạn ngạch API dùng chung từ máy chủ.**
> Để sử dụng hệ thống, bạn có 2 lựa chọn hoàn toàn miễn phí và minh bạch:

### Cách 1: Tự dùng API Key cá nhân miễn phí (BYOK - Bring Your Own Key)
Bạn có thể tự đăng ký API Key cá nhân hoàn toàn miễn phí (không yêu cầu thẻ tín dụng) từ Google AI Studio:
1. Truy cập **[Google AI Studio](https://aistudio.google.com/app/apikey)** và đăng nhập bằng tài khoản Google của bạn.
2. Bấm **Create API Key** để tạo key mới.
   - Hạn mức miễn phí từ Google: **15 yêu cầu/phút (RPM)**, **1.500 yêu cầu/ngày (RPD)**, và **1.000.000 tokens/phút**.
3. Điền API Key trực tiếp vào file `backend/.env`:
   ```env
   MODEL_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy...dien_api_key_cua_ban_tai_day
   GEMINI_MODEL=gemini-1.5-flash
   ```
4. Khởi động lại backend để hệ thống kích hoạt ModelGateway kết nối trực tiếp với Google Gemini 1.5 Flash.

### Cách 2: Chạy chế độ Ngoại tuyến không cần API (Offline Heuristic Engine)
- Nếu bạn không cấu hình `GEMINI_API_KEY` (hoặc để trống), CareerForge sẽ **tự động kích hoạt bộ máy suy luận Heuristic nội bộ**.
- Hệ thống vẫn hoạt động đầy đủ 100% tính năng:
  - Tự động đối chiếu kỹ năng và tính điểm khớp ATS thời gian thực.
  - Phân tích và sinh câu mô tả nâng cấp chuẩn công thức Google X-Y-Z.
  - Cung cấp kho 10+ câu hỏi phỏng vấn chuẩn mực phủ sóng đầy đủ các chủ đề kiến trúc phân tán.
  - Chấm điểm câu trả lời phỏng vấn theo 4 trụ cột STAR (Situation, Task, Action, Result) bằng giải thuật phân tích cấu trúc ngôn ngữ và chỉ số định lượng.

---

## ✨ Chi tiết 3 Không gian làm việc (3 Workspaces)

### 1. Workspace 1: Việc làm & Hồ sơ (Jobs & Radar)
- **Tin tuyển dụng thực tế tại Việt Nam**: Tích hợp các vị trí kỹ thuật cấp cao từ VNG, MoMo, Viettel, FPT, Techcombank... kèm mức đãi ngộ thực tế (30M - 65M VND/tháng) và đường dẫn tin gốc / tìm kiếm Google.
- **Phân tích JD tự chọn (Custom JD Analyzer)**: Người dùng có thể dán nội dung bất kỳ bản mô tả công việc (JD) nào để trích xuất ngay danh sách kỹ năng, yêu cầu cốt lõi và đối chiếu với hồ sơ.
- **Hồ sơ bằng chứng thật (Evidence Lake)**: Tải lên CV thực tế (PDF/Scan) và liên kết GitHub, hệ thống tự động bóc tách số commit, số repository và lập chỉ mục vector trên Qdrant để đối chiếu khi viết CV.

### 2. Workspace 2: Soạn thảo & Tối ưu CV (ATS Resume Studio)
- **Công thức định lượng Google X-Y-Z**:
  $$\text{Đạt được [X] đo lường bằng [Y], bằng cách triển khai [Z]}$$
- **Chuyển đổi 1-Click từ JD**: Chuyển thẳng từ tin tuyển dụng sang màn hình tối ưu hóa CV cho công việc mục tiêu.
- **So sánh Trước/Sau (Before vs After Diff)**: Xem trực quan câu cũ và câu mới đã được nâng cấp số liệu định lượng, kèm nút bấm 1-click áp dụng ngay vào nội dung CV.
- **Bảng điều khiển AI Prompt Console**: Nhập trực tiếp yêu cầu để AI viết lại bullet points, hoặc bấm chọn nhanh các gợi ý (Bổ sung kỹ năng thiếu, Thêm số liệu định lượng, Giọng văn Kỹ sư Trưởng).
- **Thước đo điểm ATS thời gian thực (Real-time ATS Score)**: Đánh giá độ phủ từ khóa, độ xác thực bằng chứng thật (Ground-truth) và mật độ số liệu đo lường.
- **Giao diện tối giản & Xuất file**: Ẩn mặc định khung Swarm Telemetry để tập trung làm việc; xem trước khổ giấy A4 chuẩn máy quét ATS và tải trực tiếp file Markdown `.md`.

### 3. Workspace 3: Luyện phỏng vấn thực chiến STAR (Mock Interview Lab)
- **Tùy chọn số lượng câu hỏi**: Cho phép chọn tạo **4, 6, 8, hoặc 10 câu hỏi** phỏng vấn dựa trên sự giao thoa giữa CV và JD.
- **Nút "➕ Tạo thêm câu hỏi"**: Sinh thêm 3 câu hỏi mới mà không làm mất danh sách câu hỏi cũ, có cơ chế gửi `existing_question_ids` để chống trùng lặp.
- **Nút "✍️ Tự thêm câu hỏi"**: Modal trực quan cho phép ứng viên tự nhập các câu hỏi phỏng vấn thực tế của riêng mình và chọn kỹ năng đánh giá.
- **Kho câu hỏi 10 chuyên đề kỹ thuật chuyên sâu**:
  1. *Kỹ thuật chuyên sâu (CV Skills)*: High Concurrency, Async I/O, Connection Pooling.
  2. *Kiến trúc hệ thống & Tích hợp*: Transactional Outbox Pattern, Event Streaming, Idempotency.
  3. *Bù đắp khoảng trống kỹ năng (Skill Gap)*: Khả năng tự học và làm chủ công nghệ mới (K8s, Tracing...).
  4. *Tình huống thực tế (STAR)*: Xử lý sự cố nghiêm trọng (P0 Incident), thương lượng Code Quality vs Velocity.
  5. *Tối ưu hóa Database & Caching*: Profiling query, Composite Indexing, chống Cache Stampede/Avalanche.
  6. *Khả năng chịu tải & Độ tin cậy API*: Circuit Breaker, Token Bucket Rate Limiting, Graceful Degradation.
  7. *Bảo mật & Xác thực hệ thống*: Stateless JWT Revocation, Redis Blacklist, RBAC và an toàn dữ liệu.
  8. *Quan sát hệ thống (Observability)*: OpenTelemetry, Distributed Tracing, 4 Golden Signals.
  9. *CI/CD & Vận hành Hạ tầng*: Zero-Downtime Deployment (Rolling/Blue-Green), Docker multi-stage, Auto Rollback.
  10. *Lãnh đạo kỹ thuật & Văn hóa Đội ngũ*: Quy chuẩn Code Review, quản trị Nợ kỹ thuật (Tech Debt), Mentorship.
- **Bộ lọc danh mục (Category Filter Chips)**: Lọc nhanh câu hỏi theo từng chủ đề mong muốn.
- **Chấm điểm STAR Rubric thời gian thực (Live STAR Scoreboard)**: Đánh giá 4 trụ cột S - T - A - R, phân tích tỷ lệ đóng góp cá nhân ('I' vs 'We'), số liệu đo lường, chỉ ra điểm mạnh (Strengths) và góp ý cải thiện (Suggestions).

---

## 🤖 Ma trận Đa tác nhân (Multi-Agent Swarm & RBAC Matrix)

| Agent Role | Model Prompt | Quyền hạn công cụ (Permitted Scopes) | Rào cản an toàn (Forbidden Scopes) |
| :--- | :--- | :--- | :--- |
| **Candidate Profiler** | Capability extractor & commit analyzer | `READ_CV`, `CALL_GITHUB`, `WRITE_EVIDENCE` | Global Admin, External Web Mutation |
| **Market Hunter** | Job requisition parser & skill extractor | `FETCH_MARKET_JOBS`, `CALL_FIRE_CRAWL` | `WRITE_EVIDENCE` (Không được sửa đổi bằng chứng ứng viên) |
| **Skill Strategist** | Gap analysis & 48h Sprint generator | `READ_JD`, `READ_PROFILE` | Database Write, Evidence Mutation |
| **Resume Strategist** | `GOOGLE_XYZ_SYSTEM_PROMPT` (ATS synthesis) | `LLM_SYNTHESIS`, `READ_EVIDENCE` | Direct Database Write, Evidence Mutation |
| **Fact Checker (Critic)** | Strict anti-hallucination forensic auditor | `STRICT_READ_EVIDENCE`, `VECTOR_QUERY` | **`WRITE_EVIDENCE` (Chặn hoàn toàn bằng `PermissionDeniedError`)** |
| **STAR Interviewer** | `STAR_EVAL_SYSTEM_PROMPT` (STAR Rubric coach) | `LLM_SYNTHESIS`, `SPEECH_EVALUATION` | Evidence Mutation, Job Configuration |

---

## 🛠 Công nghệ sử dụng (Tech Stack)

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Context API (Bilingual VI/EN), Axios, SSE |
| **Backend Gateway** | FastAPI, Python 3.11+, Pydantic v2, Async SQLAlchemy, Uvicorn |
| **Agent Engine** | Autonomous Swarm Core, ModelGateway (BYOK & Heuristic Fallback), ToolRegistry with RBAC, Async EventBus |
| **AI / LLM** | Google AI Studio (`gemini-1.5-flash`), OpenAI GPT-4o, Anthropic Claude 3.5, Local Ollama/vLLM |
| **Vector Database** | Qdrant Vector Search Engine (Cosine Similarity & Grounding Verification) |
| **Lưu trữ & Cache** | PostgreSQL 16 (Relational DB), Redis 7 (Pub/Sub & Caching), MinIO (Resume S3) |
| **Kiểm thử** | Pytest, Pytest-Asyncio, HTTPX, TypeScript Build Checks (`tsc -b`) |

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Quick Start Guide)

### Yêu cầu tiên quyết
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) v20+ và npm / pnpm
- [Python](https://www.python.org/) 3.11+

### 1. Clone mã nguồn
```bash
git clone https://github.com/MinhTran110/career-forge.git
cd career-forge
```

### 2. Khởi động hạ tầng Docker (PostgreSQL, Redis, Qdrant, MinIO)
```bash
cd docker
docker-compose up -d
cd ..
```
*Các cổng dịch vụ mặc định:*
- PostgreSQL: `5434`
- Redis: `6381`
- Qdrant Vector Engine: `6333`
- MinIO S3: `9000` (Console: `9001`)

### 3. Cài đặt Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```
Cấu hình thông số trong `.env`:
```env
# Database & Cache
DATABASE_URL=postgresql+asyncpg://careerforge:careerforge_secret@localhost:5434/careerforge_db
REDIS_URL=redis://localhost:6381/0
QDRANT_HOST=localhost
QDRANT_PORT=6333

# Cấu hình AI (Tự điền API key cá nhân từ Google AI Studio nếu muốn dùng trực tiếp, hoặc để trống để chạy Offline)
MODEL_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

Khởi chạy server FastAPI:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Tài liệu tương tác API Swagger UI có tại: `http://localhost:8000/docs`.

### 4. Cài đặt Frontend
Mở một terminal mới:
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
Truy cập giao diện web tại `http://localhost:5173`.

---

## 🧪 Kiểm thử tự động (Verification & Automated Testing)

CareerForge sở hữu bộ test tự động toàn diện kiểm chứng tất cả các luồng hoạt động của hệ thống:
```bash
# Chạy toàn bộ 22 bài kiểm thử tự động của backend
backend/.venv/bin/pytest backend/tests/ -v
```
Kết quả kiểm thử:
```text
backend/tests/test_agent_architecture.py::test_tool_registry_rbac_enforcement PASSED
backend/tests/test_agent_architecture.py::test_model_gateway_routing_and_fallback PASSED
backend/tests/test_agent_architecture.py::test_event_bus_pubsub_lifecycle PASSED
backend/tests/test_agent_architecture.py::test_application_engine_end_to_end_with_events PASSED
backend/tests/test_enhancements.py::test_get_my_profile_and_custom_jd_endpoints PASSED
backend/tests/test_phase1.py::test_health_check PASSED
backend/tests/test_phase1.py::test_auth_full_lifecycle PASSED
backend/tests/test_phase2.py::test_document_parser_and_metrics PASSED
backend/tests/test_phase2.py::test_image_scan_and_contextual_chunking PASSED
backend/tests/test_phase2.py::test_vector_grounding_and_claim_verification PASSED
backend/tests/test_phase2.py::test_full_profile_setup_api PASSED
backend/tests/test_phase3.py::test_job_hunter_url_cleaning_and_fingerprint PASSED
backend/tests/test_phase3.py::test_market_hunter_tier_classification PASSED
backend/tests/test_phase3.py::test_radar_api_endpoints PASSED
backend/tests/test_phase4.py::test_skill_strategist_gap_and_roadmap PASSED
backend/tests/test_phase4.py::test_resume_strategist_xyz_formula PASSED
backend/tests/test_phase4.py::test_fact_checker_critic_audit PASSED
backend/tests/test_phase4.py::test_application_engine_dual_loop PASSED
backend/tests/test_phase4.py::test_applications_api_lifecycle PASSED
backend/tests/test_phase5.py::test_star_interviewer_question_generation PASSED
backend/tests/test_phase5.py::test_star_interviewer_evaluation PASSED
backend/tests/test_phase5.py::test_interview_api_lifecycle PASSED

============================== 22 passed in 100% ==============================
```

Kiểm tra build frontend:
```bash
npm --prefix frontend run build
```

---

## 🔒 An toàn & Bảo mật (Security Guardrails)

- **Ngăn chặn đầu độc dữ liệu (Zero Data Poisoning)**: FactChecker agent bị chặn hoàn toàn quyền ghi vào Qdrant.
- **Cô lập thông tin nhạy cảm**: API key cấu hình an toàn ở tầng backend `.env`, không bao giờ bị đưa vào bundle client.
- **Ngưỡng kiểm chứng nghiêm ngặt**: Mọi tuyên bố trong CV cần đạt độ tương đồng cosine $\ge 0.75$ với bằng chứng thật trong Qdrant; nếu không đạt sẽ bị từ chối và yêu cầu viết lại.
- **Chế độ kiểm tra độc lập**: Hỗ trợ chạy offline an toàn tuyệt đối cho người dùng không muốn gửi dữ liệu qua API bên thứ ba.

---

## 📄 License

Dự án được phân phối theo giấy phép mã nguồn mở [MIT License](LICENSE).
