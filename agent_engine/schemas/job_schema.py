
from pydantic import BaseModel, Field


class JobSchema(BaseModel):
    id: str
    title: str
    company: str
    location: str | None = "Remote"
    salary_range: str | None = None
    description: str
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    match_score: float = 0.0
