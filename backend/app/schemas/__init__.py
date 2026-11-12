from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Job Schemas
class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str | None = None
    salary_range: str | None = None
    job_type: str = "Full-time"
    url: str | None = None
    description: str
    tier: str = "target"  # safe, target, reach
    requirements: list[str] = []
    tech_stack: list[str] = []
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    match_score: float = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomJDRequest(BaseModel):
    title: str = "Senior AI Engineer"
    company: str = "Tech Company"
    description: str
    salary_range: str | None = "$120k - $160k"
    location: str | None = "Remote"
    url: str | None = None



# Application & ATS Schemas
class ApplicationCreate(BaseModel):
    job_id: str


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: str
    ats_score: float
    tailored_resume_markdown: str | None = None
    pdf_storage_key: str | None = None
    gap_matrix: dict[str, Any] = {}
    mini_project_roadmap: dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransformationItemSchema(BaseModel):
    id: str
    original: str
    improved: str
    grounded_source: str
    skill_tag: str
    impact: str
    applied: bool = True


class PromptTailorRequest(BaseModel):
    prompt: str
    current_resume_markdown: str
    job_id: str | None = None
    target_job_title: str | None = None
    target_skills: list[str] = []
    company: str | None = None


class PromptTailorResponse(BaseModel):
    updated_markdown: str
    feedback: str
    new_transformations: list[TransformationItemSchema] = []
    score_delta: str | None = "+4.5%"



# STAR & Interview Schemas
class StarFeedback(BaseModel):
    situation_score: float
    task_score: float
    action_score: float
    result_score: float
    strengths: list[str] = []
    improvements: list[str] = []
    recommended_answer: str | None = None


class InterviewSessionCreate(BaseModel):
    job_id: str | None = None
    title: str | None = None
    interview_type: str = "technical_and_behavioral"


class AnswerSubmission(BaseModel):
    question_index: int = 0
    answer_text: str


class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    job_id: str | None = None
    title: str
    overall_score: float
    questions: list[dict[str, Any]] = []
    star_feedback: dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerateQuestionsFromCvRequest(BaseModel):
    job_id: str | None = None
    job_title: str | None = None
    job_description: str | None = None
    cv_skills: list[str] = []
    target_requirements: list[str] = []
    num_questions: int = 4


class InterviewQuestionItem(BaseModel):
    id: str
    category: str
    question: str
    skill_evaluated: str
    cv_evidence_context: str
    sample_star_answer: str
    tips_for_candidate: str


class GenerateQuestionsFromCvResponse(BaseModel):
    job_title: str
    matched_skills: list[str]
    missing_skills: list[str]
    questions: list[InterviewQuestionItem]
