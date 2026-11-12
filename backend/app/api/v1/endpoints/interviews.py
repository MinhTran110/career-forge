import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm.attributes import flag_modified

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.job import Job
from app.models.profile import Profile
from app.models.interview import InterviewSession
from app.schemas import (
    InterviewSessionCreate,
    AnswerSubmission,
    InterviewSessionResponse,
    GenerateQuestionsFromCvRequest,
    GenerateQuestionsFromCvResponse,
)
from agent_engine.agents.star_interviewer import StarInterviewerAgent

router = APIRouter()
star_interviewer = StarInterviewerAgent()


@router.post("/generate-questions-from-cv", response_model=GenerateQuestionsFromCvResponse)
async def generate_questions_from_cv(
    payload: GenerateQuestionsFromCvRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generates hyper-tailored interview questions cross-referencing candidate's CV skills with the target Job Description."""
    job_title = payload.job_title or "Senior Software Engineer"
    job_desc = payload.job_description or ""
    requirements = list(payload.target_requirements)

    if payload.job_id:
        stmt = select(Job).where(Job.id == payload.job_id)
        job = (await db.execute(stmt)).scalar_one_or_none()
        if job:
            job_title = job.title
            job_desc = job.description or ""
            requirements = job.requirements or job.tech_stack or []

    # Retrieve candidate skills from Profile if not passed in payload
    cv_skills = list(payload.cv_skills)
    if not cv_skills:
        p_stmt = select(Profile).where(Profile.user_id == current_user.id)
        profile = (await db.execute(p_stmt)).scalar_one_or_none()
        if profile and profile.skills:
            cv_skills = profile.skills.get("verified", [])

    if not cv_skills:
        cv_skills = ["Python", "FastAPI", "Docker", "PostgreSQL", "Redis"]

    result = star_interviewer.generate_interview_questions_from_cv_and_jd(
        cv_skills=cv_skills,
        job_title=job_title,
        job_description=job_desc,
        target_requirements=requirements,
        num_questions=payload.num_questions,
    )
    return result


@router.post("/session", response_model=InterviewSessionResponse)
async def create_interview_session(
    payload: InterviewSessionCreate = InterviewSessionCreate(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Initializes a role-tailored technical & behavioral mock interview session."""
    target_job = None
    if payload.job_id:
        stmt = select(Job).where(Job.id == payload.job_id)
        target_job = (await db.execute(stmt)).scalar_one_or_none()

    job_title = target_job.title if target_job else "Senior Software Engineer"
    tech_stack = target_job.tech_stack if target_job else ["Python", "FastAPI", "Docker", "PostgreSQL"]
    requirements = target_job.requirements if target_job else []

    title = payload.title or f"{job_title} Technical & Behavioral Simulator"

    # Generate tailored questions
    questions = star_interviewer.generate_interview_questions(
        job_title=job_title,
        tech_stack=tech_stack,
        requirements=requirements,
        num_questions=3,
    )

    now = datetime.now(timezone.utc)
    new_session = InterviewSession(
        id=f"int_{uuid.uuid4().hex[:10]}",
        user_id=current_user.id,
        job_id=payload.job_id,
        title=title,
        overall_score=0.0,
        questions=questions,
        star_feedback={},
        created_at=now,
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)

    return new_session


@router.post("/{session_id}/answer", response_model=InterviewSessionResponse)
async def submit_question_answer(
    session_id: str,
    payload: AnswerSubmission,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Evaluates candidate response across 4 STAR dimensions and updates the scoreboard."""
    stmt = select(InterviewSession).where(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id,
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = list(session.questions)
    if payload.question_index < 0 or payload.question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question index")

    target_q = questions[payload.question_index]
    eval_result = star_interviewer.evaluate_star_answer(
        question=target_q.get("question", ""),
        answer_text=payload.answer_text,
    )

    # Attach evaluation to target question
    target_q["user_answer"] = payload.answer_text
    target_q["star_evaluation"] = eval_result
    questions[payload.question_index] = target_q

    # Recompute cumulative overall score
    evaluated_scores = [q["star_evaluation"]["overall_score"] for q in questions if "star_evaluation" in q]
    cumulative_score = round(sum(evaluated_scores) / len(evaluated_scores), 1) if evaluated_scores else 0.0

    session.questions = list(questions)
    session.overall_score = cumulative_score
    session.star_feedback = {
        "latest_evaluation": eval_result,
        "total_questions_answered": len(evaluated_scores),
        "cumulative_star_score": cumulative_score,
    }
    flag_modified(session, "questions")
    flag_modified(session, "star_feedback")

    await db.commit()
    await db.refresh(session)
    return session


@router.get("/{session_id}/scoreboard")
async def get_session_scoreboard(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves comprehensive 4-dimension STAR scoreboard with breakdown and recommendations."""
    stmt = select(InterviewSession).where(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id,
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = session.questions or []
    answered = [q for q in questions if "star_evaluation" in q]

    if not answered:
        return {
            "session_id": session.id,
            "title": session.title,
            "overall_score": 0.0,
            "status": "in_progress",
            "answered_count": 0,
            "total_questions": len(questions),
            "message": "No answers submitted yet.",
        }

    s_avg = round(sum(q["star_evaluation"]["situation_score"] for q in answered) / len(answered), 1)
    t_avg = round(sum(q["star_evaluation"]["task_score"] for q in answered) / len(answered), 1)
    a_avg = round(sum(q["star_evaluation"]["action_score"] for q in answered) / len(answered), 1)
    r_avg = round(sum(q["star_evaluation"]["result_score"] for q in answered) / len(answered), 1)

    all_strengths = []
    all_improvements = []
    for q in answered:
        all_strengths.extend(q["star_evaluation"].get("strengths", []))
        all_improvements.extend(q["star_evaluation"].get("improvements", []))

    return {
        "session_id": session.id,
        "title": session.title,
        "overall_score": session.overall_score,
        "status": "completed" if len(answered) == len(questions) else "in_progress",
        "answered_count": len(answered),
        "total_questions": len(questions),
        "star_dimension_averages": {
            "situation": s_avg,
            "task": t_avg,
            "action": a_avg,
            "result": r_avg,
        },
        "key_strengths": list(dict.fromkeys(all_strengths)),
        "areas_for_improvement": list(dict.fromkeys(all_improvements)),
    }


@router.get("", response_model=List[InterviewSessionResponse])
async def list_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lists past mock interview sessions for current candidate."""
    stmt = select(InterviewSession).where(InterviewSession.user_id == current_user.id).order_by(InterviewSession.created_at.desc())
    results = await db.execute(stmt)
    return list(results.scalars().all())


@router.get("/{session_id}", response_model=InterviewSessionResponse)
async def get_interview_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(InterviewSession).where(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id,
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    return session
