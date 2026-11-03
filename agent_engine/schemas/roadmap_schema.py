
from pydantic import BaseModel, Field


class ProjectMilestone(BaseModel):
    hour: int
    title: str
    deliverable: str


class RoadmapPlanSchema(BaseModel):
    job_id: str
    skill_gaps: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    project_title: str
    project_summary: str
    deliverables: list[str] = Field(default_factory=list)
    milestones_48h: list[ProjectMilestone] = Field(default_factory=list)
