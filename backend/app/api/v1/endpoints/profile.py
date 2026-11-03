from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from agent_engine.agents.candidate_profiler import CandidateProfilerAgent
from agent_engine.tools.vector_retriever import VectorRetrieverTool

router = APIRouter()
vector_tool = VectorRetrieverTool()
profiler_agent = CandidateProfilerAgent(vector_tool=vector_tool)


@router.post("/setup")
async def setup_candidate_profile(
    github_username: Optional[str] = Form(None),
    cv_file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cv_bytes = None
    filename = ""
    mime_type = ""
    if cv_file:
        cv_bytes = await cv_file.read()
        filename = cv_file.filename or ""
        mime_type = cv_file.content_type or ""

    # Run profiling and grounding pipeline
    result = profiler_agent.profile_and_ground(
        candidate_id=current_user.id,
        name=current_user.full_name or "Engineer",
        email=current_user.email,
        cv_bytes=cv_bytes,
        github_username=github_username,
        filename=filename,
        mime_type=mime_type,
    )

    # Persist in PostgreSQL
    stmt = select(Profile).where(Profile.user_id == current_user.id)
    profile_record = (await db.execute(stmt)).scalar_one_or_none()

    if not profile_record:
        profile_record = Profile(
            id=f"prof_{current_user.id[4:]}",
            user_id=current_user.id,
        )
        db.add(profile_record)

    profile_record.headline = f"{current_user.full_name or 'Engineer'} - Verified Tech Core"
    profile_record.github_username = github_username
    profile_record.skills = {"verified": result["profile"]["verified_skills"]}
    profile_record.verified_experience = result["profile"]["verified_repos"]
    profile_record.github_metrics = result["github_metrics"]

    await db.commit()
    await db.refresh(profile_record)

    return {
        "status": "success",
        "message": "Candidate profile successfully extracted and grounded in Qdrant Evidence Lake.",
        "profile": result["profile"],
        "indexed_evidence_count": result["indexed_evidence_count"],
        "github_metrics": result["github_metrics"],
    }


@router.get("/evidence")
async def query_candidate_evidence(
    query: str,
    limit: int = 5,
    current_user: User = Depends(get_current_user),
):
    results = vector_tool.retrieve_evidence(
        candidate_id=current_user.id,
        query=query,
        limit=limit,
    )
    return {
        "candidate_id": current_user.id,
        "query": query,
        "evidences": results,
    }
