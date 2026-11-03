import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.job import Job
from app.schemas import JobResponse
from agent_engine.agents.market_hunter import MarketHunterAgent
from agent_engine.tools.vector_retriever import VectorRetrieverTool

router = APIRouter()
vector_tool = VectorRetrieverTool()
market_hunter = MarketHunterAgent(vector_tool=vector_tool)


@router.post("/scan", response_model=List[JobResponse])
async def trigger_market_scan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Triggers Market Hunter Agent to scrape fresh jobs, compute semantic match, deduplicate and persist."""
    # 1. Fetch user's verified skills
    stmt = select(Profile).where(Profile.user_id == current_user.id)
    profile = (await db.execute(stmt)).scalar_one_or_none()
    skills = []
    if profile and profile.skills:
        skills = profile.skills.get("verified", [])
    if not skills:
        skills = ["Python", "FastAPI", "React", "Docker", "PostgreSQL", "Redis"]

    # 2. Run Market Hunter Agent evaluation
    evaluated_jobs = market_hunter.evaluate_and_rank_jobs(
        candidate_id=current_user.id,
        candidate_skills=skills,
    )

    persisted_jobs = []
    for item in evaluated_jobs:
        fp = item.get("fingerprint")
        # Check if job already exists by fingerprint (deduplication)
        exist_stmt = select(Job).where(Job.fingerprint == fp)
        existing_job = (await db.execute(exist_stmt)).scalar_one_or_none()

        now = datetime.now(timezone.utc)
        if existing_job:
            # Update last_seen_at & match score
            existing_job.match_score = item["match_score"]
            existing_job.tier = item["tier"]
            existing_job.matched_skills = item["matched_skills"]
            existing_job.missing_skills = item["missing_skills"]
            existing_job.last_seen_at = now
            persisted_jobs.append(existing_job)
        else:
            new_job = Job(
                id=f"job_{uuid.uuid4().hex[:10]}",
                title=item["title"],
                company=item["company"],
                location=item.get("location", "Remote"),
                salary_range=item.get("salary_range", "$100k+"),
                job_type=item.get("job_type", "Remote"),
                url=item.get("url"),
                description=item["description"],
                fingerprint=fp,
                tier=item["tier"],
                requirements=item.get("requirements", []),
                tech_stack=item.get("tech_stack", []),
                matched_skills=item["matched_skills"],
                missing_skills=item["missing_skills"],
                match_score=item["match_score"],
                created_at=now,
                scraped_at=now,
                last_seen_at=now,
            )
            db.add(new_job)
            persisted_jobs.append(new_job)

    await db.commit()
    for j in persisted_jobs:
        await db.refresh(j)

    return persisted_jobs


@router.get("/jobs", response_model=List[JobResponse])
async def get_recommended_jobs(
    tier: Optional[str] = Query("all", description="Filter by tier: all, safe, target, reach"),
    job_type: Optional[str] = Query("all", description="Filter by job type: all, Remote, Hybrid, Onsite"),
    min_score: float = Query(0.0, ge=0.0, le=100.0),
    db: AsyncSession = Depends(get_db),
):
    """Returns curated job postings with match scores and tier breakdown."""
    stmt = select(Job).order_by(Job.match_score.desc())
    result = await db.execute(stmt)
    jobs = list(result.scalars().all())

    # If DB has no jobs yet, auto seed and return
    if not jobs:
        hunter = MarketHunterAgent()
        sample_jobs = hunter.evaluate_and_rank_jobs(
            candidate_id="default_candidate",
            candidate_skills=["Python", "FastAPI", "React", "Docker", "PostgreSQL", "Redis"],
        )
        now = datetime.now(timezone.utc)
        for s in sample_jobs:
            new_job = Job(
                id=f"job_{uuid.uuid4().hex[:10]}",
                title=s["title"],
                company=s["company"],
                location=s.get("location", "Remote"),
                salary_range=s.get("salary_range", "$100k+"),
                job_type=s.get("job_type", "Remote"),
                url=s.get("url"),
                description=s["description"],
                fingerprint=s.get("fingerprint"),
                tier=s["tier"],
                requirements=s.get("requirements", []),
                tech_stack=s.get("tech_stack", []),
                matched_skills=s["matched_skills"],
                missing_skills=s["missing_skills"],
                match_score=s["match_score"],
                created_at=now,
                scraped_at=now,
                last_seen_at=now,
            )
            db.add(new_job)
            jobs.append(new_job)
        await db.commit()
        for j in jobs:
            await db.refresh(j)

    # Apply filters
    filtered = jobs
    if tier and tier.lower() != "all":
        filtered = [j for j in filtered if j.tier.lower() == tier.lower()]
    if job_type and job_type.lower() != "all":
        filtered = [j for j in filtered if j.job_type.lower() == job_type.lower()]
    if min_score > 0:
        filtered = [j for j in filtered if j.match_score >= min_score]

    return filtered


@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job_detail(job_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Job).where(Job.id == job_id)
    job = (await db.execute(stmt)).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
