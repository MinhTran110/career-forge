from datetime import datetime
from sqlalchemy import String, Float, JSON, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    company: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    salary_range: Mapped[str] = mapped_column(String(100), nullable=True)
    job_type: Mapped[str] = mapped_column(String(50), default="Full-time")  # Remote, Hybrid, Onsite
    url: Mapped[str] = mapped_column(String(500), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    requirements: Mapped[list] = mapped_column(JSON, default=list)
    tech_stack: Mapped[list] = mapped_column(JSON, default=list)
    match_score: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    scraped_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="job")
