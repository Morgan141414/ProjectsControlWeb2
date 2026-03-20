from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SQLITE_URL = f"sqlite:///{(BASE_DIR / 'data' / 'app.db').as_posix()}"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Productivity Control API"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = DEFAULT_SQLITE_URL

    # JWT — SECRET_KEY is mandatory in production
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage – "local" or "s3"
    STORAGE_DRIVER: str = "local"
    STORAGE_PATH: str = "./data/recordings"
    MAX_UPLOAD_MB: int = 2048
    RETENTION_DAYS: int = 90

    # S3-compatible storage (used when STORAGE_DRIVER="s3")
    S3_ENDPOINT_URL: str = ""
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = "projectscontrol"
    S3_REGION: str = "us-east-1"
    S3_PREFIX: str = "recordings"
    METRICS_MAX_GAP_SECONDS: int = 300
    EVENTS_RETENTION_DAYS: int = 30

    # Reports
    REPORTS_PATH: str = "./data/reports"
    REPORTS_MAX_EXPORT_MB: int = 50
    REPORTS_WEBHOOK_TIMEOUT_SECONDS: int = 5
    SCHEDULE_TICK_SECONDS: int = 300
    PREVIEWS_PATH: str = "data/previews"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:3000"

    # OAuth
    GOOGLE_OAUTH_CLIENT_ID: str | None = None
    APPLE_CLIENT_ID: str | None = None  # Apple Service ID (e.g., com.example.webapp)

    # Redis (Phase 3)
    REDIS_URL: str = "redis://localhost:6379/0"

    # SMTP Email (Phase 4)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@projectscontrol.com"
    SMTP_USE_TLS: bool = True

    # Sentry (Phase 7)
    SENTRY_DSN: str = ""

    # Rate limiting
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_GLOBAL: str = "100/minute"
    ACCOUNT_LOCKOUT_MINUTES: int = 15
    ACCOUNT_LOCKOUT_ATTEMPTS: int = 5

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def jwt_secret_must_be_set(cls, v: str) -> str:
        import os
        if not v and os.getenv("ENVIRONMENT", "development") == "production":
            raise ValueError(
                "JWT_SECRET_KEY must be set in production. "
                "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
            )
        if not v:
            # In development, generate a random key (with a warning)
            import secrets
            import warnings
            warnings.warn(
                "JWT_SECRET_KEY not set — using random key. Tokens will be invalidated on restart.",
                stacklevel=2,
            )
            return secrets.token_urlsafe(32)
        return v

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)


settings = Settings()
