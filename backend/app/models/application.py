from datetime import datetime
from sqlalchemy import String, Float, JSON, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    job_id: Mapped[str] = mapped_column(String(36), ForeignKey("jobs.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, tailored, verified, submitted

    # Tailored artifacts
    tailored_resume_markdown: Mapped[str] = mapped_column(Text, nullable=True)
    pdf_storage_key: Mapped[str] = mapped_column(String(255), nullable=True)
    ats_score: Mapped[float] = mapped_column(Float, default=0.0)
    gap_matrix: Mapped[dict] = mapped_column(JSON, default=dict)
    mini_project_roadmap: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
