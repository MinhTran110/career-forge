from fastapi import APIRouter, BackgroundTasks
from app.schemas import ApplicationCreate, ApplicationResponse


router = APIRouter()


@router.post("/tailor", response_model=ApplicationResponse)
async def create_tailored_application(payload: ApplicationCreate, background_tasks: BackgroundTasks):
    return {
        "id": "app_tailor_999",
        "user_id": "usr_sample123",
        "job_id": payload.job_id,
        "status": "tailoring_in_progress",
        "ats_score": 85.5,
        "tailored_resume_markdown": """# Senior AI Engineer\n\n- Optimized distributed LLM inference pipelines lowering TTFT by 35% using vLLM and TensorRT.\n- Orchestrated Celery queues with Redis to handle 50k daily background tasks with 99.99% uptime.""",
        "pdf_storage_key": "resumes/user_123_job_101.pdf",
        "gap_matrix": {
            "strengths": ["FastAPI", "Python", "Celery", "Docker"],
            "gaps": ["Triton Inference Server", "CUDA Optimization"],
        },
        "mini_project_roadmap": {
            "title": "48h Mini-Project: vLLM Benchmark & Triton Proxy",
            "objective": "Build a reverse-proxy load balancer with Triton metrics and GitHub Actions CI.",
            "estimated_hours": 12,
        },
        "created_at": "2026-11-03T11:00:00Z"
    }
