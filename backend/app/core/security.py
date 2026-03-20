"""Authentication utilities: password hashing, JWT access/refresh tokens."""

import hashlib
import secrets
from datetime import timedelta

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings
from app.core.time import utc_now_naive


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


# ---------------------------------------------------------------------------
# Access tokens (short-lived, stateless)
# ---------------------------------------------------------------------------

def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    if expires_minutes is None:
        expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire = utc_now_naive() + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise ValueError("Not an access token")
        return payload
    except JWTError as exc:
        raise ValueError("Invalid token") from exc


# ---------------------------------------------------------------------------
# Refresh tokens (long-lived, stored as hash in DB)
# ---------------------------------------------------------------------------

def generate_refresh_token() -> str:
    """Generate a cryptographically secure random refresh token string."""
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    """SHA-256 hash of the raw refresh token (stored in DB, never the raw value)."""
    return hashlib.sha256(token.encode()).hexdigest()


def create_refresh_token_payload(subject: str) -> dict:
    """Build a JWT-like payload for verification, but the real secret is the random token."""
    expire = utc_now_naive() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return {"sub": subject, "exp": expire, "type": "refresh"}
