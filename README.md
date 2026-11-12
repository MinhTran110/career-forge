# CareerForge 🚀
**Autonomous Multi-Agent AI Career Co-Pilot & Real-Time Job Readiness Engine**

[![CI Pipeline](https://img.shields.io/badge/CI-Passing-brightgreen?style=flat-square&logo=githubactions)](https://github.com/MinhTran110/career-forge/actions)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector_DB-DC2626?style=flat-square&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_AI_Studio-Gemini_1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 💡 Overview

**CareerForge** is a production-grade autonomous multi-agent platform designed to bridge the gap between engineering talent and competitive tech job markets. Unlike static resume builders or generic LLM wrappers, CareerForge enforces **cryptographic and vector-grounded anti-hallucination guardrails**, real-time **Actor-Critic multi-agent debate**, and an **evidence lake** indexed directly from candidate repositories, commits, and verified metrics.

### Key Pillars
- **Zero-Cost High-Performance LLM Gateway**: Built-in support for **Google AI Studio (`gemini-1.5-flash`)** utilizing Google's free tier (15 RPM / 1M TPM / 1,500 RPD without credit card) alongside in-app UI settings and automated heuristic fallback for offline testing.
- **Vietnamese Tech Market Jobs**: Seeded with authentic domestic engineering opportunities (VNG Corporation, MoMo M-Service, Viettel Solutions, FPT Software, Techcombank) with real VND salary packages and direct careers portal links.
- **Actor-Critic Anti-Hallucination Loop**: A dual-loop system where the **Resume Strategist (Actor)** generates high-impact Google X-Y-Z bullets while the **Fact Checker (Critic)** strictly audits every single metric against an immutable Qdrant Evidence Lake.
- **Role-Based Access Control (RBAC) Tool Registry**: Strict least-privilege tool execution—Critic agents are cryptographically barred from write operations to prevent synthetic evidence hallucination.
- **Dedicated CV & JD Interview Studio**: Automatically cross-references skills verified from the candidate's CV with the target company's JD to generate technical deep-dive, system design, and STAR behavioral questions with model answers and tips.

---

## 🏛 System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React 19 + TypeScript + Vite)"]
        UI_Radar["🎯 Việc làm & Hồ sơ (Vietnam Tech Jobs & Profile)"]
        UI_Editor["✍️ ATS Resume Studio (Google X-Y-Z Diff & Gap Matrix)"]
        UI_Interview["🎙️ Luyện phỏng vấn (CV & JD Tailored STAR Lab)"]
        UI_ApiKey["⚙️ Cài đặt API AI (Google Gemini Free Tier)"]
    end

    subgraph Gateway["FastAPI API Gateway (Port 8000)"]
        Auth["JWT Auth Interceptor"]
        AppEndpoints["/api/v1/applications/tailor"]
        RadarEndpoints["/api/v1/radar/jobs & custom-jd"]
        ProfileEndpoints["/api/v1/profile/setup & /set-api-key"]
        InterviewEndpoints["/api/v1/interviews/generate-questions-from-cv"]
    end

    subgraph CoreEngine["Agent Engine Core (agent_engine/core/)"]
        ModelGW["ModelGateway<br/>(Gemini 1.5 Flash / OpenAI / Claude / Fallback)"]
        ToolReg["ToolRegistry & RBAC<br/>(Least-Privilege Scope Enforcement)"]
        EventBus["AgentEventBus<br/>(Async Pub/Sub + Replay Buffer)"]
    end

    subgraph Swarm["Multi-Agent Swarm (agent_engine/agents/)"]
        CP["Candidate Profiler"]
        MH["Market Hunter"]
        SS["Skill Strategist"]
        RS["Resume Strategist (Actor)"]
        FC["Fact Checker (Critic - Strict Read-Only)"]
        SI["STAR Interviewer (CV & JD Question Engine)"]
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

## 🤖 Multi-Agent Swarm & RBAC Matrix

To guarantee candidate integrity, each agent in the swarm operates under strict Role-Based Access Control (RBAC) enforced by the [`ToolRegistry`](agent_engine/core/tool_registry.py):

| Agent Role | Model System Prompt | Permitted Tool Scopes | Forbidden Scopes (Safety Guardrail) |
| :--- | :--- | :--- | :--- |
| **Candidate Profiler** | Capability extractor & commit analyzer | `READ_CV`, `CALL_GITHUB`, `WRITE_EVIDENCE` | Global Admin, External Web Mutation |
| **Market Hunter** | Job requisition parser & skill extractor | `FETCH_MARKET_JOBS`, `CALL_FIRE_CRAWL` | Candidate Evidence Mutation (`WRITE_EVIDENCE`) |
| **Skill Strategist** | Gap analysis & 48h Sprint generator | `READ_JD`, `READ_PROFILE` | Database Write, Evidence Mutation |
| **Resume Strategist** | `GOOGLE_XYZ_SYSTEM_PROMPT` (ATS synthesis) | `LLM_SYNTHESIS`, `READ_EVIDENCE` | Direct Database Write, Evidence Mutation |
| **Fact Checker (Critic)** | Strict anti-hallucination forensic auditor | `STRICT_READ_EVIDENCE`, `VECTOR_QUERY` | **`WRITE_EVIDENCE` (Blocked with `PermissionDeniedError`)** |
| **STAR Interviewer** | `STAR_EVAL_SYSTEM_PROMPT` (STAR Rubric coach) | `LLM_SYNTHESIS`, `SPEECH_EVALUATION` | Evidence Mutation, Job Configuration |

---

## ✨ Core Features & 3 Workspaces

### 1. Workspace 1: Việc làm & Hồ sơ (Jobs & Radar)
- **Authentic Domestic Tech Jobs**: Curated with leading Vietnamese technology firms (VNG, MoMo, Viettel, FPT, Techcombank) with realistic VND compensation (30M - 65M VND/tháng) and working links.
- **Candidate Grounding**: Upload PDF resume and link GitHub to automatically parse, benchmark, and index verified evidence chunks into Qdrant vector database.
- **Clean UI**: Removed jargon and complex telemetries for an effortless, intuitive user experience.

### 2. Workspace 2: ATS Resume Studio
- **Google X-Y-Z Formula**:
  $$\text{Accomplished [X] as measured by [Y], by doing [Z]}$$
- **1-Click Tailor**: Seamless transition directly from any job card to tailored resume generation.
- **Before vs After Diff Viewer**: Live visual audit comparing candidate draft with AI-enhanced, grounded bullet points.
- **Skill Gap Summary**: Interactive tags highlighting verified matching skills vs missing requirements.

### 3. Workspace 3: Luyện phỏng vấn (CV & JD Interview Studio)
- **Automatic Question Generation**: Cross-references verified CV skills with target JD requirements.
- **Categorized Question Types**:
  - *Kỹ thuật chuyên sâu (CV Skills)*: Deep architecture and I/O questions tailored to candidate's background.
  - *Kiến trúc & Tích hợp (JD Scale)*: High-throughput distributed patterns requested by the employer.
  - *Kỹ năng mở rộng (Skill Gap)*: How candidate bridges gap skills.
  - *Tình huống STAR & Leadership*: Resolving technical debt and outage incidents.
- **STAR Model Answers & Interview Tips**: Full outline with Situation, Task, Action, Result and recruiter advice.
- **Instant 4-Pillar Scoring**: Live evaluation scoring Situation, Task, Action, Result, plus actionable strengths and improvements.

### 4. Zero-Cost LLM Setup (Google AI Studio)
- Click **`⚙️ Cài đặt API (Miễn phí)`** in the header to activate live LLM capabilities with a free Google Gemini key in seconds.
- 100% Free: 15 RPM / 1M TPM / 1,500 RPD without credit card.
- Supports Google Gemini (`gemini-1.5-flash`), Groq Cloud (Llama 3.3 70B), and local vLLM / Ollama.


---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Lucide Icons, Axios, SSE EventSource |
| **Backend Gateway** | FastAPI, Python 3.11+, Pydantic v2, Async SQLAlchemy, Uvicorn |
| **Agent Engine** | Autonomous Swarm Core, ModelGateway, ToolRegistry with RBAC, Async EventBus |
| **LLM & AI** | Google AI Studio (`gemini-1.5-flash`), OpenAI GPT-4o, Anthropic Claude 3.5, Local vLLM |
| **Vector Database** | Qdrant Vector Search Engine (Cosine Similarity & Grounding Claims) |
| **Storage & Cache** | PostgreSQL 16 (Relational DB), Redis 7 (Pub/Sub & Caching), MinIO (Resume S3) |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX, TypeScript Build Checks (`tsc -b`) |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) v20+ and npm / pnpm
- [Python](https://www.python.org/) 3.11+

### 1. Clone Repository
```bash
git clone https://github.com/MinhTran110/career-forge.git
cd career-forge
```

### 2. Start Supporting Infrastructure
Launch PostgreSQL, Redis, Qdrant, and MinIO:
```bash
cd docker
docker-compose up -d
cd ..
```

*Default Ports:*
- PostgreSQL: `5434`
- Redis: `6381`
- Qdrant Vector Engine: `6333`
- MinIO S3: `9000` (Console: `9001`)

### 3. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file (or set environment variables):
```env
# Database & Cache
DATABASE_URL=postgresql+asyncpg://careerforge:careerforge_secret@localhost:5434/careerforge_db
REDIS_URL=redis://localhost:6381/0
QDRANT_HOST=localhost
QDRANT_PORT=6333

# LLM Configuration (Google AI Studio - Free Tier)
MODEL_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

> **Note**: If `GEMINI_API_KEY` is omitted, CareerForge automatically activates the built-in deterministic heuristic engine.

Start the FastAPI development server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at `http://localhost:8000/docs`.

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Verification & Automated Testing

CareerForge maintains an exhaustive automated test suite covering all phases of the platform, including RBAC tool authorization, ModelGateway fallback, async event streaming, and end-to-end multi-agent tailoring.

Run backend tests:
```bash
PYTHONPATH=".:backend" backend/.venv/bin/pytest backend/tests/ -v
```

Expected output:
```text
backend/tests/test_agent_architecture.py::test_tool_registry_rbac_enforcement PASSED [  4%]
backend/tests/test_agent_architecture.py::test_model_gateway_routing_and_fallback PASSED [  9%]
backend/tests/test_agent_architecture.py::test_event_bus_pubsub_lifecycle PASSED [ 13%]
backend/tests/test_agent_architecture.py::test_application_engine_end_to_end_with_events PASSED [ 18%]
backend/tests/test_enhancements.py::test_get_my_profile_and_custom_jd_endpoints PASSED [ 22%]
backend/tests/test_phase1.py::test_health_check PASSED                   [ 27%]
backend/tests/test_phase1.py::test_auth_full_lifecycle PASSED            [ 31%]
backend/tests/test_phase2.py::test_document_parser_and_metrics PASSED    [ 36%]
backend/tests/test_phase2.py::test_image_scan_and_contextual_chunking PASSED [ 40%]
backend/tests/test_phase2.py::test_vector_grounding_and_claim_verification PASSED [ 45%]
backend/tests/test_phase2.py::test_full_profile_setup_api PASSED         [ 50%]
backend/tests/test_phase3.py::test_job_hunter_url_cleaning_and_fingerprint PASSED [ 54%]
backend/tests/test_phase3.py::test_market_hunter_tier_classification PASSED [ 59%]
backend/tests/test_phase3.py::test_radar_api_endpoints PASSED            [ 63%]
backend/tests/test_phase4.py::test_skill_strategist_gap_and_roadmap PASSED [ 68%]
backend/tests/test_phase4.py::test_resume_strategist_xyz_formula PASSED  [ 72%]
backend/tests/test_phase4.py::test_fact_checker_critic_audit PASSED      [ 77%]
backend/tests/test_phase4.py::test_application_engine_dual_loop PASSED   [ 81%]
backend/tests/test_phase4.py::test_applications_api_lifecycle PASSED     [ 86%]
backend/tests/test_phase5.py::test_star_interviewer_question_generation PASSED [ 90%]
backend/tests/test_phase5.py::test_star_interviewer_evaluation PASSED    [ 95%]
backend/tests/test_phase5.py::test_interview_api_lifecycle PASSED        [100%]

============================== 22 passed in 7.49s ==============================
```

Verify frontend production build:
```bash
npm --prefix frontend run build
```

---

## 🔒 Security & Privacy Guardrails

- **Zero Data Poisoning**: FactChecker agent strictly cannot write to Qdrant vector storage.
- **Credential Segregation**: API keys are isolated within the backend configuration layer and never exposed to the client bundle.
- **JWT Authentication**: Secured endpoints enforce user session validation with automated interceptor bearer injection.
- **Strict Anti-Hallucination Threshold**: Resume claims require vector similarity $\ge 0.75$ against verified chunks in Qdrant; ungrounded claims are rejected and sent back to the Strategist for revision.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
