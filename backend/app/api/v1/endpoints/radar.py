from fastapi import APIRouter, Query
from typing import List
from app.schemas import JobResponse


router = APIRouter()


@router.get("/jobs", response_model=List[JobResponse])
async def get_recommended_jobs(
    min_score: float = Query(0.0, ge=0.0, le=100.0),
    job_type: str = Query("all"),
):
    return [
        {
            "id": "job_101",
            "title": "Senior AI Infrastructure Engineer",
            "company": "DeepScale AI",
            "location": "Remote (US/APAC)",
            "salary_range": "$140,000 - $180,000",
            "job_type": "Remote",
            "url": "https://example.com/careers/deepscale-ai",
            "description": "Building high-performance distributed LLM serving systems with vLLM, Triton, and Kubernetes.",
            "requirements": ["FastAPI", "Python", "Kubernetes", "vLLM", "Distributed Systems"],
            "tech_stack": ["Python", "FastAPI", "Docker", "K8s", "CUDA"],
            "match_score": 92.5,
            "created_at": "2026-11-03T10:00:00Z"
        },
        {
            "id": "job_102",
            "title": "Full-Stack AI Platform Lead",
            "company": "ForgeTech",
            "location": "Hybrid - Singapore",
            "salary_range": "$120,000 - $150,000",
            "job_type": "Hybrid",
            "url": "https://example.com/careers/forgetech",
            "description": "Architecting multi-agent user interfaces with React 19, FastAPI, SSE, and Celery.",
            "requirements": ["React 19", "TypeScript", "FastAPI", "Celery", "PostgreSQL"],
            "tech_stack": ["React", "TypeScript", "TailwindCSS", "FastAPI", "Redis"],
            "match_score": 88.0,
            "created_at": "2026-11-03T09:30:00Z"
        }
    ]
