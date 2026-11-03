from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


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
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: str = "Full-time"
    url: Optional[str] = None
    description: str
    tier: str = "target"  # safe, target, reach
    requirements: List[str] = []
    tech_stack: List[str] = []
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    match_score: float = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Application & ATS Schemas
class ApplicationCreate(BaseModel):
    job_id: str


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_id: str
    status: str
    ats_score: float
    tailored_resume_markdown: Optional[str] = None
    pdf_storage_key: Optional[str] = None
    gap_matrix: Dict[str, Any] = {}
    mini_project_roadmap: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# STAR & Interview Schemas
class StarFeedback(BaseModel):
    situation_score: float
    task_score: float
    action_score: float
    result_score: float
    strengths: List[str] = []
    improvements: List[str] = []
    recommended_answer: Optional[str] = None


class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    job_id: Optional[str] = None
    title: str
    overall_score: float
    questions: List[Dict[str, Any]] = []
    star_feedback: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
