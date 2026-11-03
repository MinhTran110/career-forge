from pydantic import BaseModel, Field
from typing import List, Dict, Any


class RepositoryProof(BaseModel):
    repo_name: str
    stars: int = 0
    top_languages: List[str] = Field(default_factory=list)
    key_commits: List[str] = Field(default_factory=list)


class CandidateProfileSchema(BaseModel):
    candidate_id: str
    name: str
    email: str
    verified_skills: List[str] = Field(default_factory=list)
    experience_years: float = 0.0
    verified_repos: List[RepositoryProof] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
