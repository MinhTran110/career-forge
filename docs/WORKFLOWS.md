# CareerForge: Kiến Trúc Hệ Thống & Đặc Tả 4 Luồng Workflow Toàn Diện

Tài liệu này mô tả chi tiết **Kiến trúc hệ thống phân tầng (Layered System Architecture)** và **4 Luồng quy trình nghiệp vụ (End-to-End Workflows)** của nền tảng **CareerForge**.

---

## 1. Sơ Đồ Kiến Trúc Hệ Thống Đa Tầng (Layered System Architecture)

```mermaid
flowchart TB
    subgraph PresentationLayer["1. Presentation Layer (Frontend - React 19 + Vite)"]
        UI_Dash["Dashboard & Job Radar (Safe/Target/Reach)"]
        UI_Editor["ATS Markdown Split-View & Typst Preview"]
        UI_Interview["Voice Mock Interview Room (Web Audio API)"]
        UI_Pipeline["Real-time Agent Stepper & Event Log Viewer"]
        Zustand["Zustand Global Stores (useAuth, useInterviewStore)"]
        UI_Dash --- Zustand
        UI_Editor --- Zustand
        UI_Interview --- Zustand
    end

    subgraph GatewayLayer["2. Gateway & Edge Services (FastAPI Backend)"]
        API_Auth["/api/v1/auth (JWT, User Management)"]
        API_Radar["/api/v1/radar (Job Search, Tier Filters)"]
        API_Tailor["/api/v1/applications (Tailor Flow Dispatcher)"]
        API_Interview["/api/v1/interviews (Voice Evaluation API)"]
        API_Stream["/api/v1/streams (Server-Sent Events Gateway)"]
        Typst_Service["Typst Compiler Engine (<50ms PDF Rendering)"]
        Whisper_Service["Whisper Speech-to-Text Transcriber"]
    end

    subgraph AsyncOrchestration["3. Event Bus & Asynchronous Worker Pool (Celery + Redis)"]
        Redis_Broker[("Redis Broker & Pub/Sub")]
        Celery_Worker["Celery Distributed Workers\n(Concurrent Task Wrappers)"]
        Redis_Broker <--> Celery_Worker
    end

    subgraph MultiAgentEngine["4. Multi-Agent Specialized Core (CrewAI + Pydantic v2)"]
        A_Hunter["Market Hunter Agent\n(Scrapes & Ranks Jobs)"]
        A_Profiler["Candidate Profiler Agent\n(Mines GitHub & Parses CV)"]
        A_Strategist["Skill Strategist Agent\n(Gap Matrix & 48h Mini-Projects)"]
        A_Resume["Resume Strategist Agent\n(X-Y-Z Quantifiable Resumes)"]
        A_Critic["Fact Checker Agent (Critic)\n(Zero-Hallucination Audit)"]
        A_Interviewer["STAR Interviewer Agent\n(Rubric Evaluator: S-T-A-R)"]
    end

    subgraph PersistenceLayer["5. Persistence & Evidence Lake"]
        Postgres[("PostgreSQL 16\n- Users & Profiles\n- Scraped Jobs\n- Applications & Versions\n- Interview Sessions")]
        Qdrant[("Qdrant Vector DB\n- Candidate Ground-Truth Chunks\n- Job Requirements Embeddings\n- Semantic Cosine Index")]
        MinIO[("MinIO S3 Object Storage\n- Compiled ATS PDFs\n- Original CVs\n- Interview Audio Blobs")]
    end

    %% Wiring connections
    PresentationLayer -->|HTTPS REST| GatewayLayer
    PresentationLayer <-->|SSE Stream / WebSocket| API_Stream
    GatewayLayer -->|Async Dispatch| Redis_Broker
    GatewayLayer -->|Read/Write Metadata| Postgres
    Celery_Worker --> MultiAgentEngine
    MultiAgentEngine -->|Read/Write Vectors| Qdrant
    MultiAgentEngine -->|Publish Stage Events| Redis_Broker
    Redis_Broker -->|Relay to Clients| API_Stream
    Typst_Service -->|Store PDF| MinIO
    Whisper_Service -->|Fetch Audio| MinIO
```

---

## 2. Đặc Tả 4 Luồng Workflow Nghiệp Vụ Cốt Lõi

### Workflow 1: Onboarding & Candidate Evidence Grounding Flow
> **Mục tiêu**: Xây dựng kho "Ground-Truth Evidence Lake" của ứng viên, ngăn chặn triệt để hiện tượng AI tự ý bịa đặt (hallucination) ở các bước sau.

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Ứng Viên
    participant FE as Frontend (React 19)
    participant API as FastAPI Gateway
    participant MinIO as MinIO Storage
    participant Queue as Redis / Celery
    participant Profiler as Candidate Profiler Agent
    participant GH as GitHub GraphQL API
    participant Qdrant as Qdrant Vector DB
    participant DB as PostgreSQL

    Candidate->>FE: Upload CV cũ (.pdf) & nhập GitHub username
    FE->>API: POST /api/v1/auth/profile/setup (Multipart form)
    API->>MinIO: Lưu trữ file CV gốc
    API->>Queue: Dispatch task: audit_candidate_profile(user_id)
    API-->>FE: 202 Accepted (Bắt đầu lắng nghe SSE)

    Queue->>Profiler: Nhận task phân tích hồ sơ
    Profiler->>MinIO: Tải CV gốc & chạy Docling / pdfplumber
    Profiler->>GH: Truy vấn commits, PRs, top languages, pinned repos
    Profiler->>Profiler: Chuẩn hóa thành CandidateProfileSchema
    
    Profiler->>Qdrant: Tạo embeddings & nạp các mẩu bằng chứng (Evidence Chunks)
    Profiler->>DB: Lưu hồ sơ năng lực & liên kết tài khoản
    Profiler->>Queue: Publish event: "Candidate Profile Verified"
    Queue-->>FE: SSE Event: Cập nhật chỉ số năng lực thời gian thực lên Dashboard
```

---

### Workflow 2: Autonomous Job Radar Discovery & Ranking Flow
> **Mục tiêu**: Tự động săn tìm việc làm, phân tích ngữ nghĩa và xếp hạng cơ hội theo 3 tầng: **Safe**, **Target**, **Reach**.

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Celery Beat / Trigger
    participant Hunter as Market Hunter Agent
    participant Web as Firecrawl / Job Boards
    participant Qdrant as Qdrant Vector DB
    participant DB as PostgreSQL
    participant FE as Frontend Radar UI

    Cron->>Hunter: Trigger periodic scan: run_job_discovery()
    Hunter->>Web: Cào tin tuyển dụng mới theo tech stack
    Hunter->>Hunter: Chuẩn hóa thông tin tuyển dụng (JobSchema)
    
    loop Đối soát từng Job với Profile ứng viên
        Hunter->>Qdrant: Semantic similarity search giữa JD và Evidence Lake
        Hunter->>Hunter: Tính toán match_score (0 - 100%) & số lượng critical gaps
        alt Match Score >= 85% và ít hơn 2 gaps
            Hunter->>Hunter: Phân loại: TIER 1 - SAFE
        else Match Score 70% - 84%
            Hunter->>Hunter: Phân loại: TIER 2 - TARGET
        else Match Score 55% - 69%
            Hunter->>Hunter: Phân loại: TIER 3 - REACH
        end
    end

    Hunter->>DB: Lưu danh sách Jobs đã gắn phân loại & Match Score
    FE->>DB: GET /api/v1/radar/jobs?tier=target
    DB-->>FE: Trả về danh sách thẻ việc làm kèm Match Score Gauge
```

---

### Workflow 3: Dual-Loop Resume Tailoring & Zero-Hallucination Audit Flow
> **Mục tiêu**: May đo CV 1:1 cho vị trí tuyển dụng mục tiêu theo công thức định lượng Google X-Y-Z, có Critic Agent kiểm toán chống thổi phồng số liệu, và xuất file Typst PDF.

```mermaid
sequenceDiagram
    autonumber
    actor User as Ứng Viên
    participant FE as Frontend (ResumeEditorPage)
    participant API as FastAPI Gateway
    participant Queue as Celery Queue
    participant Strategist as Skill Strategist Agent
    participant Writer as Resume Strategist Agent
    participant Critic as Fact Checker Agent (Critic)
    participant Qdrant as Qdrant Evidence Lake
    participant Typst as Typst Compiler Service
    participant MinIO as MinIO Storage

    User->>FE: Bấm "Tailor Resume" cho 1 Job cụ thể
    FE->>API: POST /api/v1/applications/tailor
    API->>Queue: Dispatch task: run_application_tailor(user_id, job_id)
    API-->>FE: 202 Accepted (Mở SSE Stream)

    %% Vòng 1: Gap Analysis & 48h Sprint
    Queue->>Strategist: Đối soát khoảng cách kỹ năng (Gap Matrix)
    Strategist->>Strategist: Thiết kế 48-Hour Mini-Project Blueprint
    Strategist->>Queue: Publish Event: "Gap Analysis & 48h Roadmap Ready"

    %% Vòng 2: Viết CV định lượng
    Queue->>Writer: Chắp bút bullet points theo Google X-Y-Z
    Writer->>Critic: Gửi bản thảo Markdown CV để kiểm duyệt

    %% Vòng lặp phản biện chống Hallucination (Critic Audit Loop)
    loop Audit chéo với Evidence Lake
        Critic->>Qdrant: Kiểm tra từng số liệu (%, $), công nghệ và repo
        alt Phát hiện kỹ năng hoặc số liệu chưa được chứng minh
            Critic-->>Writer: REJECT: Yêu cầu hạ số liệu hoặc thay bằng kinh nghiệm thực tế
            Writer->>Writer: Viết lại bullet point bám sát sự thật
        else Dữ liệu hợp lệ 100% (Zero Hallucination)
            Critic-->>Writer: APPROVED: Phê duyệt bản thảo
        end
    end

    Critic->>Typst: Gửi Markdown/Typst đã phê duyệt
    Typst->>Typst: Biên dịch sang PDF chuẩn ATS (<50ms)
    Typst->>MinIO: Lưu trữ file PDF xuất xưởng
    
    Queue->>FE: SSE Event: Hoàn tất may đo hồ sơ
    FE->>FE: Hiển thị Split-view (Markdown bên trái, ATS PDF bên phải)
```

---

### Workflow 4: Real-Time Audio Mock Interview & Live STAR Scoring Flow
> **Mục tiêu**: Mô phỏng phỏng vấn trực tiếp, ứng viên trả lời bằng giọng nói qua microphone, AI bóc tách giọng nói và chấm điểm 4 thành phần STAR tức thời.

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Ứng Viên
    participant Mic as Web Audio API (Browser)
    participant FE as MockInterviewPage
    participant API as FastAPI Gateway
    participant Whisper as Whisper STT Service
    participant Interviewer as STAR Interviewer Agent
    participant DB as PostgreSQL

    Candidate->>FE: Bấm "Start Mock Session"
    FE->>API: POST /api/v1/interviews/sessions
    API-->>FE: Trả về câu hỏi phỏng vấn kỹ thuật/tình huống dựa trên JD mục tiêu

    Candidate->>Mic: Bật Microphone & trả lời câu hỏi bằng giọng nói
    Mic->>FE: Hiển thị Live Audio Waveform động
    Candidate->>FE: Bấm "Stop & Evaluate"
    FE->>API: POST /sessions/{id}/evaluate-audio (Audio Blob WAV)

    API->>Whisper: Giải mã âm thanh thành văn bản (Speech-to-Text)
    Whisper-->>API: Trả về Transcription
    
    API->>Interviewer: Đánh giá câu trả lời theo STAR Rubric
    Interviewer->>Interviewer: Bóc tách 4 thành phần:\n- S (Situation): Bối cảnh kỹ thuật (0-100)\n- T (Task): Trách nhiệm cá nhân (0-100)\n- A (Action): Quyết định kỹ thuật & trade-off (0-100)\n- R (Result): Kết quả định lượng (0-100)
    Interviewer->>Interviewer: Tổng hợp điểm Composite Score & gợi ý cải thiện

    Interviewer->>DB: Lưu chi tiết phiên phỏng vấn và bảng điểm
    Interviewer-->>API: Trả về StarEvaluationSchema
    API-->>FE: Cập nhật Live STAR Scoreboard & đề xuất câu trả lời chuẩn mực
```

---

## 3. Vòng Đời Trạng Thái Của Hồ Sơ (Application State Machine)

```mermaid
stateDiagram-v2
    [*] --> Draft: Khởi tạo hồ sơ ứng tuyển
    
    Draft --> GapAnalysisInProgress: Bắt đầu tối ưu
    GapAnalysisInProgress --> RoadmapGenerated: Đã có Ma trận khuyết điểm & 48h Sprint
    
    RoadmapGenerated --> ResumeTailoring: Bắt đầu viết lại CV
    ResumeTailoring --> FactCheckAudit: Gửi sang Critic Agent
    
    state FactCheckAudit {
        [*] --> VerifyingClaims
        VerifyingClaims --> NeedsRevision: Phát hiện số liệu ảo / thiếu căn cứ
        NeedsRevision --> VerifyingClaims: Viết lại bullet point
        VerifyingClaims --> AuditPassed: 100% bằng chứng xác thực
    }
    
    FactCheckAudit --> CompilingPDF: Chuyển sang Typst Engine
    CompilingPDF --> ReadyToApply: File PDF chuẩn ATS sẵn sàng
    
    ReadyToApply --> MockInterviewInProgress: Luyện phỏng vấn thử
    MockInterviewInProgress --> InterviewMastered: Điểm STAR >= 85%
    InterviewMastered --> Submitted: Nộp hồ sơ đến nhà tuyển dụng
    Submitted --> [*]
```

---

## 4. Tóm Tắt Các Điểm Kỹ Thuật Trọng Tâm Của Workflow

| Giai đoạn | Thách thức kỹ thuật | Giải pháp kiến trúc của CareerForge |
| :--- | :--- | :--- |
| **Grounding** | Ứng viên thổi phồng CV hoặc AI bịa đặt kinh nghiệm | Dùng Qdrant lưu trữ mẩu bằng chứng thực tế từ GitHub API và CV cũ để làm chốt kiểm duyệt bắt buộc |
| **Discovery** | Tin tuyển dụng tràn lan, khó xác định độ vừa sức | Phân 3 tầng minh bạch: Safe ($\ge 85\%$), Target ($70-84\%$), Reach ($55-69\%$) |
| **Actionable** | Lời khuyên học tập mơ hồ | Thiết kế 48h Mini-Project có mốc 12h/24h/36h/48h cụ thể để code bổ sung portfolio |
| **Tailoring** | Định dạng CV xuất ra bị lỗi font/bảng biểu khi qua ATS | Thay thế HTML/Word bằng **Typst Compiler**, render file PDF chuẩn ATS trong dưới 50ms |
| **Interview** | Phản hồi phỏng vấn chung chung, thiếu chiều sâu | Khung chấm điểm STAR 4 chiều độc lập kèm Live Scoreboard cập nhật tức thì |
