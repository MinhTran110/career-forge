from pydantic import BaseModel, Field
from typing import List


class ProjectMilestone(BaseModel):
    hour: int
    title: str
    deliverable: str


class RoadmapPlanSchema(BaseModel):
    job_id: str
    skill_gaps: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    project_title: str
    project_summary: str
    deliverables: List[str] = Field(default_factory=list)
    milestones_48h: List[ProjectMilestone] = Field(default_factory=list)
