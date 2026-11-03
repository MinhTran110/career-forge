from pydantic import BaseModel, Field
from typing import List, Optional


class JobSchema(BaseModel):
    id: str
    title: str
    company: str
    location: Optional[str] = "Remote"
    salary_range: Optional[str] = None
    description: str
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    match_score: float = 0.0
