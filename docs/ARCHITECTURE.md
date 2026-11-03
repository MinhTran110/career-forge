# CareerForge: Phân Tích Kiến Trúc & Chi Tiết Các Module Thành Phần

Tài liệu này phân tích chi tiết toàn diện 6 module nghiệp vụ cốt lõi và các lớp hạ tầng kỹ thuật của hệ thống **CareerForge** (*Autonomous AI Career Co-Pilot & Mock Interview Simulator*).

---

## 1. Sơ Đồ Kiến Trúc Tổng Thể (System Architecture)

```mermaid
flowchart TB
    subgraph Client["Frontend Client (React 19 + Vite)"]
        UI_Radar["Job Radar (Safe/Target/Reach)"]
        UI_Editor["ATS Markdown & Typst Split-View"]
        UI_Interview["Mock Interview Room (Web Audio API)"]
        UI_Pipeline["Real-time Agent Stepper & SSE Viewer"]
    end

    subgraph Gateway["Backend Gateway (FastAPI)"]
        API_Auth["Auth & User Profile API"]
        API_Radar["Job Radar API"]
        API_Tailor["Application Tailor API"]
        API_Interview["Interview & Voice Evaluation API"]
        SSE_Stream["SSE Event Bus Streamer"]
        Typst_Service["Typst PDF Compiler Service"]
    end

    subgraph AsyncQueue["Event Bus & Worker (Celery + Redis)"]
        Redis_Broker[("Redis Broker & Pub/Sub")]
        Worker["Celery Distributed Workers"]
    end

    subgraph MultiAgent["Multi-Agent Engine (CrewAI + Pydantic v2)"]
        A1["Market Hunter Agent"]
        A2["Candidate Profiler Agent"]
        A3["Skill Strategist Agent"]
        A4["Resume Strategist Agent"]
        A5["Fact Checker (Critic Auditor)"]
        A6["STAR Interviewer Agent"]
    end

    subgraph Storage["Persistence & Evidence Lake"]
        Postgres[("PostgreSQL 16\n(Users, Jobs, Apps, Sessions)")]
        Qdrant[("Qdrant Vector DB\n(Ground-Truth Embeddings)")]
        MinIO[("MinIO / S3\n(PDFs, Audio, Markdown)")]
    end

    %% Client to Gateway
    UI_Radar -->|REST| API_Radar
    UI_Editor -->|REST / Blob| API_Tailor
    UI_Editor -->|Markdown| Typst_Service
    UI_Interview -->|Audio Waveform / Multipart| API_Interview
    UI_Pipeline <-->|Server-Sent Events| SSE_Stream

    %% Gateway to Async & Storage
    API_Radar --> Postgres
    API_Tailor --> Redis_Broker
    API_Interview --> Redis_Broker
    Redis_Broker --> Worker
    Worker --> MultiAgent

    %% Agent Interactions with Storage
    A1 -->|Scrape & Index| Postgres
    A2 -->|Mine GitHub & CV| Qdrant
    A3 -->|Read Gaps| Postgres
    A4 -->|Generate Markdown| Postgres
    A5 -->|Audit Claims vs Ground Truth| Qdrant
    A6 -->|Transcribe & Score STAR| Postgres
    Typst_Service -->|Upload Artifacts| MinIO
```

---

## 2. Phân Tích Chi Tiết 6 Module Nghiệp Vụ Cốt Lõi

### Module 1: Profiling & Knowledge Grounding (Candidate Core & Evidence Lake)

Module này chịu trách nhiệm thu thập, xác minh và biến dữ liệu ứng viên thành **Ground-Truth Evidence** (bằng chứng thực tế không thể bịa đặt).

```mermaid
flowchart LR
    CV_PDF["CV Cũ (PDF)"] --> Docling["Docling / pdfplumber"]
    GH_Acc["GitHub Profile"] --> GH_API["GitHub GraphQL API"]
    
    Docling --> Extractor["Experience & Tech Stack Extractor"]
    GH_API --> CodeAudit["Commit & Repo Complexity Auditor"]
    
    Extractor --> Evidence["Evidence Chunks"]
    CodeAudit --> Evidence
    
    Evidence -->|Store Vector Embeddings| Qdrant[("Qdrant: candidate_knowledge")]
    Evidence -->|Structured Profile| Postgres[("PostgreSQL: profiles")]
```

* **Thành phần & Trách nhiệm**:
  * **Document Parser (`tools/document_parser.py`)**: Sử dụng Docling/pdfplumber để trích xuất văn bản có cấu trúc từ CV PDF cũ (học vấn, công ty, vị trí, công nghệ).
  * **GitHub Miner (`tools/github_graphql.py`)**: Khai thác dữ liệu thực tế từ tài khoản GitHub: commit frequency, ngôn ngữ thường dùng, số sao, pull requests và cấu trúc thư mục của các repo ghim.
  * **Vector Grounding (`tools/vector_retriever.py`)**: Tách nhỏ kinh nghiệm thành các mẩu bằng chứng (Evidence Chunks) và lưu trữ embedding trong Qdrant. Đây là lớp bảo vệ (Safety Shield) ngăn chặn Agent bịa đặt dữ liệu ở các khâu sau.

---

### Module 2: Market Intelligence & Discovery Engine (Job Radar)

Module săn tìm và phân loại việc làm tự động theo ma trận năng lực của ứng viên.

```mermaid
flowchart TD
    Scraper["Market Scraper\n(Firecrawl / Jina Reader)"] --> RawJobs["Raw Job Postings"]
    RawJobs --> Parser["Requirement & Skill Normalizer"]
    Parser --> Matcher["Vector Similarity & Constraint Evaluator"]
    
    Matcher --> Tiers{"Phân loại Cơ Hội"}
    Tiers -->|Score >= 85% & Gaps <= 1| Safe["Safe (Cơ hội an toàn - Apply ngay)"]
    Tiers -->|Score 70% - 84% & Gaps 1-3| Target["Target (Mục tiêu chuẩn - Cần tinh chỉnh)"]
    Tiers -->|Score 55% - 69% & Gaps > 3| Reach["Reach (Vươn tầm - Cần Mini-Project)"]
```

* **Phân loại 3 nhóm việc làm (Job Tiers)**:
  1. **Safe (Điểm phù hợp $\ge 85\%$)**: Ứng viên đáp ứng hầu hết yêu cầu cốt lõi. Tỷ lệ qua vòng CV rất cao.
  2. **Target (Điểm phù hợp $70\% - 84\%$)**: Đúng năng lực định hướng nhưng khuyết 1-2 công nghệ phụ hoặc domain knowledge.
  3. **Reach (Điểm phù hợp $55\% - 69\%$)**: Vị trí mơ ước ở các công ty lớn hoặc level cao hơn (vd: Senior/Lead). Cần phải làm mini-project để bù đắp điểm yếu trước khi nộp.
* **Đặc tả dữ liệu**: Được chuẩn hóa thành `JobSchema` chứa requirements, salary range, tech stack và tags.

---

### Module 3: Actionable Upskilling (Skill Gap Matrix & 48h Mini-Project)

Biến điểm yếu thành hành động cụ thể thông qua mini-project có thể bổ sung ngay vào GitHub trong 48 giờ.

```mermaid
flowchart LR
    CandidateSkills["Kỹ Năng Đã Xác Minh"] --> Diff["Ma Trận Đối Soát\n(Skill Strategist Agent)"]
    JobRequirements["Yêu Cầu Bài Tuyển Dụng"] --> Diff
    
    Diff --> GapMatrix["Skill Gap Matrix\n(Matched vs Critical Gaps)"]
    GapMatrix --> Sprint["48h Sprint Blueprint"]
    
    subgraph S48["Cấu trúc 48-Hour Sprint"]
        H12["0-12h: Init Core Architecture & Setup"]
        H24["12-24h: Implement Key Feature Solving The Gap"]
        H36["24-36h: Add Unit Tests, Benchmarks & Docker"]
        H48["36-48h: CI/CD Pipeline & GitHub Showcase README"]
        H12 --> H24 --> H36 --> H48
    end
    
    Sprint --> S48
```

* **Đặc điểm nổi bật**:
  * Không đưa ra lời khuyên chung chung ("Hãy học Docker").
  * Đưa ra dự án có mã nguồn mẫu: Ví dụ nếu ứng viên khuyết kiến thức *Distributed LLM Serving*, hệ thống sẽ gợi ý: *"Xây dựng Reverse Proxy cân bằng tải cho vLLM cache engine bằng FastAPI & Redis"*.
  * Cung cấp timeline 4 mốc (0-12h, 12-24h, 24-36h, 36-48h) với tiêu chí nghiệm thu (Deliverables) rõ ràng.

---

### Module 4: Tailored Application Engine (Zero-Hallucination ATS CV & Typst)

May đo CV 1:1 cho từng bài tuyển dụng với cơ chế kiểm duyệt chặt chẽ 2 vòng.

```mermaid
sequenceDiagram
    autonumber
    actor User as Ứng Viên
    participant RS as Resume Strategist Agent
    participant FC as Fact Checker (Critic)
    participant Qdrant as Qdrant Evidence Lake
    participant Typst as Typst PDF Compiler

    User->>RS: Yêu cầu tối ưu CV cho Job mục tiêu
    RS->>RS: Viết lại bullet points theo công thức Google X-Y-Z
    RS->>FC: Gửi bản thảo Markdown CV
    FC->>Qdrant: Truy vấn đối soát từng số liệu, công nghệ, repo
    alt Phát hiện Hallucination (thổi phồng số liệu, bịa công nghệ)
        FC-->>RS: Reject & yêu cầu hạ số liệu về ground-truth
        RS->>RS: Điều chỉnh lại bullet points trung thực
    else Xác minh thành công (0 Hallucination)
        FC-->>RS: Phê duyệt (Approved)
    end
    RS->>Typst: Gửi nội dung Markdown/Typst đã duyệt
    Typst-->>User: Trả về file PDF chuẩn ATS & hiển thị split-view
```

* **Công thức định lượng Google X-Y-Z**:
  $$\text{Accomplished [X] as measured by [Y], by doing [Z]}$$
  * *Ví dụ*: *"Tối ưu hóa pipeline xử lý tài liệu giảm độ trễ p99 đi 35% bằng cách triển khai Redis cache cluster và Celery queue partitioning."*
* **Fact Checker (Critic Auditor)**:
  * Kiểm tra chéo với vector database Qdrant để đảm bảo mọi công nghệ, repo và số liệu xuất hiện trong CV đều có bằng chứng từ GitHub hoặc CV cũ của ứng viên.
* **Typst PDF Engine**:
  * Tốc độ biên dịch cực nhanh (<50ms), tạo PDF vector sắc nét, layout chuẩn ATS không bị lỗi font hay lỗi bảng biểu.

---

### Module 5: Interactive Mock Interview Simulator (STAR Real-Time Scoring)

Mô phỏng phòng phỏng vấn trực tiếp với AI Interviewer, hỗ trợ cả giọng nói (Voice) và văn bản.

```mermaid
flowchart TD
    Candidate["Ứng Viên (Nói vào Microphone)"] --> WebAudio["Web Audio API\n(use-audio-recorder)"]
    WebAudio --> AudioBlob["Audio Blob (WAV)"]
    AudioBlob --> STT["Whisper Transcription Service"]
    STT --> Transcript["Transcribed Text"]
    
    Transcript --> STAR["STAR Interviewer Agent"]
    
    subgraph Rubric["Thang Đo 4 Thành Phần STAR (0 - 100)"]
        S["Situation (Bối cảnh: Độ phức tạp, quy mô hệ thống)"]
        T["Task (Mục tiêu: Trách nhiệm cụ thể của cá nhân)"]
        A["Action (Hành động: Quyết định kỹ thuật, công cụ, trade-offs)"]
        R["Result (Kết quả: Số liệu đo lường, tác động kinh doanh)"]
    end
    
    STAR --> Rubric
    Rubric --> Feedback["Live STAR Scoreboard & Gợi Ý Câu Trả Lời Mẫu"]
```

* **Các chiều đánh giá STAR**:
  * **Situation (S)**: Ứng viên có nêu rõ bối cảnh kỹ thuật (scale, deadline, sự cố) không?
  * **Task (T)**: Phân biệt rõ việc của cả team vs vai trò cá nhân của ứng viên.
  * **Action (A)**: Đào sâu vào giải pháp kỹ thuật, lý do chọn kiến trúc A thay vì B, các trade-off đã cân nhắc.
  * **Result (R)**: Đòi hỏi kết quả định lượng (ví dụ: giảm $20\% latency, tiết kiệm \$10k chi phí hạ tầng).
* **Live Scoreboard**:
  * Hiển thị điểm số từng phần tức thì trên giao diện frontend cùng gợi ý cải thiện cụ thể.

---

### Module 6: Orchestration, Queue & Streaming Backbone

Xương sống kết nối luồng xử lý phân tán giữa FastAPI, Celery, Redis và giao diện React.

```mermaid
flowchart LR
    subgraph FastAPILayer["FastAPI Gateway"]
        Endpoint["/api/v1/applications/tailor"]
        SSE["/api/v1/streams/agent-events/{id}"]
    end

    subgraph QueueLayer["Async Queue"]
        CeleryTask["Celery Task:\nrun_application_tailor"]
        RedisBus[("Redis Channel")]
    end

    subgraph Agents["Multi-Agent Workflow"]
        Flow["ApplicationTailorFlow"]
    end

    subgraph UI["React Client"]
        Stepper["AgentStepper Component"]
        Logs["EventLogsViewer Component"]
    end

    Endpoint -->|Dispatch Task| CeleryTask
    CeleryTask --> Flow
    Flow -->|Publish Event| RedisBus
    RedisBus -->|Bridge to SSE| SSE
    SSE -->|Stream Event| Stepper
    SSE -->|Stream Event| Logs
```

* **Celery + Redis**:
  * Tách biệt các tác vụ tốn thời gian (cào dữ liệu hàng trăm job, gọi LLM qua nhiều agent, render Typst) khỏi request-response lifecycle của FastAPI, tránh block I/O.
* **Server-Sent Events (SSE)**:
  * Frontend nhận luồng sự kiện theo thời gian thực (Step: *Market Hunter* $\to$ *Candidate Profiler* $\to$ *Skill Strategist* $\to$ *Resume Strategist* $\to$ *Fact Checker*).
  * Ứng viên nhìn thấy trực tiếp AI đang làm gì ở từng bước thay vì ngồi chờ màn hình loading vô định.

---

## 3. Ma Trận Dữ Liệu & Hợp Đồng Giao Tiếp Giữa Các Thành Phần

| Thành Phần | Input | Output | Công Nghệ / Thư Viện Chính |
| :--- | :--- | :--- | :--- |
| **Candidate Profiler** | CV PDF, GitHub Username | `CandidateProfileSchema` | Docling, PyGithub / GraphQL, Qdrant |
| **Market Hunter** | Profile keywords, Target roles | `List[JobSchema]` (Safe/Target/Reach) | Firecrawl, Jina Reader, BeautifulSoup |
| **Skill Strategist** | `CandidateProfileSchema`, `JobSchema` | `RoadmapPlanSchema` (Gap + 48h Sprint) | CrewAI, Pydantic v2 |
| **Resume Strategist** | `CandidateProfileSchema`, `JobSchema` | `TailoredResumeSchema` (Markdown) | CrewAI, Prompt Templates (X-Y-Z) |
| **Fact Checker** | `TailoredResumeSchema`, Evidence Lake | `AuditReport` (Approved/Revise) | Qdrant Cosine Similarity, Critic Agent |
| **Typst Compiler** | Markdown / Typst syntax | `resume.pdf` (Bytes) | Typst CLI, MinIO SDK |
| **STAR Interviewer** | Audio WAV / Text Answer | `StarEvaluationSchema` | Whisper, Web Audio API, CrewAI |
| **Event Streamer** | Agent Step Transitions | SSE Event Data Stream | FastAPI `StreamingResponse`, Redis Pub/Sub |

---

## 4. Các Điểm Cần Quyết Định Trong Khâu Triển Khai Tiếp Theo

> [!IMPORTANT]
> 1. **Mô hình LLM chủ đạo**: Bạn dự kiến sử dụng OpenAI (GPT-4o / GPT-4o-mini), Anthropic Claude 3.5 Sonnet, hay mô hình Open Source cục bộ (vLLM / Ollama)?
> 2. **Job Data Provider**: Thu thập qua API cào web (Firecrawl / Jina Reader) hay tích hợp trực tiếp nguồn API job board cụ thể (LinkedIn / Indeed / TopCV / ITviec)?
> 3. **Speech-to-Text Engine**: Sử dụng OpenAI Whisper Cloud API hay self-host `faster-whisper` trên Docker/GPU worker?
