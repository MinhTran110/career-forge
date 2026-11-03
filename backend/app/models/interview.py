from datetime import datetime
from sqlalchemy import String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), default="System Design & Behavioral Interview")
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Detailed STAR assessment scores & questions
    questions: Mapped[list] = mapped_column(JSON, default=list)
    star_feedback: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interviews")
