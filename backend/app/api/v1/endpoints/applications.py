import uuid
from datetime import UTC, datetime

from agent_engine.agents.application_engine import ApplicationEngine
from agent_engine.tools.vector_retriever import VectorRetrieverTool
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.application import Application
from app.models.job import Job
from app.models.profile import Profile
from app.models.user import User
from app.schemas import ApplicationCreate, ApplicationResponse

router = APIRouter()
vector_tool = VectorRetrieverTool()
app_engine = ApplicationEngine(vector_tool=vector_tool)


@router.post("/tailor", response_model=ApplicationResponse)
async def create_tailored_application(
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Executes Dual-Loop Resume Generator & Fact-Checker Critic to tailor resume and synthesize 48h roadmap."""
    # 1. Fetch Target Job
    stmt_job = select(Job).where(Job.id == payload.job_id)
    job = (await db.execute(stmt_job)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Target job not found")

    # 2. Fetch Candidate Profile
    stmt_prof = select(Profile).where(Profile.user_id == current_user.id)
    profile = (await db.execute(stmt_prof)).scalar_one_or_none()

    skills_dict = profile.skills if profile and profile.skills else {}
    verified_skills = skills_dict.get("verified", ["Python", "FastAPI", "Docker", "PostgreSQL", "Redis"])
    verified_exp = profile.verified_experience if profile and profile.verified_experience else []
    metric_highlights = skills_dict.get("metrics", ["reducing p99 latency by 35%", "handling 10k RPS in production"])

    candidate_data = {
        "full_name": current_user.full_name or "Engineer",
        "email": current_user.email,
        "github_username": profile.github_username if profile else None,
        "skills": verified_skills,
        "verified_experience": verified_exp,
        "metric_highlights": metric_highlights,
    }

    job_data = {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "requirements": job.requirements or [],
        "tech_stack": job.tech_stack or [],
        "description": job.description,
    }

    # 3. Run ApplicationEngine Dual-Loop Workflow
    result = app_engine.process_application(
        candidate_id=current_user.id,
        candidate_profile=candidate_data,
        target_job=job_data,
        workflow_id=f"wf_{job.id}",
    )

    # 4. Check if application already exists for this user and job
    app_stmt = select(Application).where(
        Application.user_id == current_user.id,
        Application.job_id == job.id,
    )
    existing_app = (await db.execute(app_stmt)).scalar_one_or_none()

    now = datetime.now(UTC)
    if existing_app:
        existing_app.status = "tailored"
        existing_app.ats_score = result["ats_score"]
        existing_app.tailored_resume_markdown = result["tailored_resume_markdown"]
        existing_app.gap_matrix = result["gap_matrix"]
        existing_app.mini_project_roadmap = result["mini_project_roadmap"]
        existing_app.updated_at = now
        app_record = existing_app
    else:
        app_record = Application(
            id=f"app_{uuid.uuid4().hex[:10]}",
            user_id=current_user.id,
            job_id=job.id,
            status="tailored",
            ats_score=result["ats_score"],
            tailored_resume_markdown=result["tailored_resume_markdown"],
            pdf_storage_key=f"resumes/{current_user.id}_{job.id}.pdf",
            gap_matrix=result["gap_matrix"],
            mini_project_roadmap=result["mini_project_roadmap"],
            created_at=now,
            updated_at=now,
        )
        db.add(app_record)

    await db.commit()
    await db.refresh(app_record)
    return app_record


@router.get("", response_model=list[ApplicationResponse])
async def list_user_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves all tailored applications for the authenticated candidate."""
    stmt = select(Application).where(Application.user_id == current_user.id).order_by(Application.created_at.desc())
    results = await db.execute(stmt)
    return list(results.scalars().all())


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application_detail(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves an application by ID with 48h roadmap and ATS audit details."""
    stmt = select(Application).where(Application.id == app_id, Application.user_id == current_user.id)
    app_record = (await db.execute(stmt)).scalar_one_or_none()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_record
