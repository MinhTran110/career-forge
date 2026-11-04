
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerForge Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-careerforge-jwt-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://careerforge:careerforge_secret@localhost:5434/careerforge_db"

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6381/0"
    CELERY_BROKER_URL: str = "redis://localhost:6381/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6381/2"

    # Qdrant Vector Search
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    # MinIO / Object Storage
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadminpassword"
    MINIO_BUCKET_NAME: str = "careerforge-resumes"
    MINIO_SECURE: bool = False

    # AI Model Keys (Google AI Studio as primary zero-cost provider)
    MODEL_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    FIRECRAWL_API_KEY: str = ""
    GITHUB_TOKEN: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
