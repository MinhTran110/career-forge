from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, Float, String, Text
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

    fingerprint: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=True)
    tier: Mapped[str] = mapped_column(String(20), index=True, default="target")  # safe, target, reach
    requirements: Mapped[list] = mapped_column(JSON, default=list)
    tech_stack: Mapped[list] = mapped_column(JSON, default=list)
    matched_skills: Mapped[list] = mapped_column(JSON, default=list)
    missing_skills: Mapped[list] = mapped_column(JSON, default=list)
    match_score: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    scraped_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    applications = relationship("Application", back_populates="job")
