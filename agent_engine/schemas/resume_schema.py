
from typing import Any
from pydantic import BaseModel, Field


class BulletPoint(BaseModel):
    text: str
    quantifiable_metric: str
    verified_source: str


class TailoredResumeSchema(BaseModel):
    job_id: str
    headline: str
    summary: str
    tailored_experience: list[dict[str, Any]] = Field(default_factory=list)
    highlighted_skills: list[str] = Field(default_factory=list)
    ats_score: float = 0.0
    markdown_content: str
