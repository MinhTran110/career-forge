
from pydantic import BaseModel, Field


class RepositoryProof(BaseModel):
    repo_name: str
    stars: int = 0
    top_languages: list[str] = Field(default_factory=list)
    key_commits: list[str] = Field(default_factory=list)


class CandidateProfileSchema(BaseModel):
    candidate_id: str
    name: str
    email: str
    verified_skills: list[str] = Field(default_factory=list)
    experience_years: float = 0.0
    verified_repos: list[RepositoryProof] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
