# CareerForge 🚀
**Autonomous AI-Powered Career Copilot & Real-Time Job Readiness Engine**

CareerForge is an end-to-end multi-agent career acceleration platform that monitors real-time tech jobs, analyzes candidate skill gaps against live market demands, creates tailored 48-hour mini-projects, rewrites ATS-compliant resumes verified against actual GitHub/work artifacts, and runs voice-enabled mock interviews scored on the STAR framework.

---

## 🏛 Architecture Overview

```text
careerforge/
├── .github/workflows/          # CI/CD (backend, frontend, automated deployment)
├── docker/                     # Infrastructure (PostgreSQL, Redis, Qdrant, MinIO)
├── frontend/                   # Modern React 19 + Vite + TypeScript Client
├── backend/                    # FastAPI Gateway, Async SQLAlchemy & REST/SSE Endpoints
└── agent_engine/               # Multi-Agent Specialized Core (CrewAI + Celery)
```

### 🤖 6 Specialized AI Agents
1. **Market Hunter**: Autonomous job board scraping & semantic matching.
2. **Candidate Profiler**: In-depth CV & GitHub profile capability extraction.
3. **Skill Strategist**: Gap analysis and 48-hour actionable project roadmap synthesis.
4. **Resume Strategist**: Quantitative ATS resume tailoring with typst output.
5. **Fact Checker (Critic)**: Anti-hallucination verification engine against candidate ground truth.
6. **STAR Interviewer**: Voice/text interactive mock interview & real-time STAR evaluation.

---

## 🚀 Quickstart

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ & pnpm / npm
- Python 3.11+

### 1. Launch Core Infrastructure
```bash
cd docker
docker-compose up -d
```

### 2. Run Backend Gateway
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Run Agent Engine Worker
```bash
cd agent_engine
celery -A tasks.celery_tasks worker --loglevel=info
```

### 4. Run Frontend Client
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡 License
MIT © CareerForge Team
