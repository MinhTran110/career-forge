from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    headline: Mapped[str] = mapped_column(String(255), nullable=True)
    github_username: Mapped[str] = mapped_column(String(100), nullable=True)
    linkedin_url: Mapped[str] = mapped_column(String(255), nullable=True)

    # JSON field for verified skills, repositories, and benchmark scores
    skills: Mapped[dict] = mapped_column(JSON, default=dict)
    verified_experience: Mapped[list] = mapped_column(JSON, default=list)
    github_metrics: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="profile")
