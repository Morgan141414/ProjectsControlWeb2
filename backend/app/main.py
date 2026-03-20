"""FastAPI application entrypoint with production middleware stack."""

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import api_router
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.middleware import (
    RequestIdMiddleware,
    RequestLoggingMiddleware,
    SecurityHeadersMiddleware,
)
from app.core.rate_limit import limiter
from app.core.retention import cleanup_activity_events, cleanup_recordings
from app.core.scheduler import shutdown_scheduler, start_scheduler
from app.core.sentry import init_sentry
from app.db.session import SessionLocal, engine

# Initialize structured logging and Sentry before anything else
setup_logging()
init_sentry()
logger = structlog.get_logger()

app = FastAPI(
    title=settings.PROJECT_NAME,
    docs_url="/api/v1/docs",
    openapi_url="/api/v1/openapi.json",
    redoc_url="/api/v1/redoc",
)

# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# Middleware stack (order matters — outermost first)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "X-Request-ID",
    ],
    expose_headers=["X-Request-ID"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RequestIdMiddleware)


# ---------------------------------------------------------------------------
# Exception handler
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "unhandled_exception",
        method=request.method,
        path=request.url.path,
        error=str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ---------------------------------------------------------------------------
# Lifecycle events
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup() -> None:
    # NOTE: In production, run `alembic upgrade head` before starting the app.
    # Auto-create tables only in development as a convenience.
    if settings.ENVIRONMENT != "production":
        from app.db.base import Base
        Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        deleted_recordings = cleanup_recordings(db)
        deleted_events = cleanup_activity_events(db)
        if deleted_recordings or deleted_events:
            db.commit()
    start_scheduler()
    logger.info("application_started", environment=settings.ENVIRONMENT)


@app.on_event("shutdown")
def on_shutdown() -> None:
    shutdown_scheduler()
    logger.info("application_stopped")


# ---------------------------------------------------------------------------
# Health checks
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
def health() -> dict:
    """Liveness probe — the process is running."""
    return {"status": "ok"}


@app.get("/ready", tags=["health"])
def readiness():
    """Readiness probe — the database is reachable."""
    from sqlalchemy import text

    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "ok"}
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": str(exc)},
        )


# ---------------------------------------------------------------------------
# Routes — all under /api/v1 prefix
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix="/api/v1")
