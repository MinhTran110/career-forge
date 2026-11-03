
from pydantic import BaseModel, Field


class StarEvaluationSchema(BaseModel):
    session_id: str
    question: str
    transcription: str
    situation_score: float = Field(ge=0.0, le=100.0)
    task_score: float = Field(ge=0.0, le=100.0)
    action_score: float = Field(ge=0.0, le=100.0)
    result_score: float = Field(ge=0.0, le=100.0)
    overall_score: float = 0.0
    strengths: list[str] = Field(default_factory=list)
    critique: list[str] = Field(default_factory=list)
    exemplary_star_answer: str | None = None
