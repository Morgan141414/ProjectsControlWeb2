"""Redis connection and cache utilities."""

import json
import logging
from typing import Any

import redis

from app.core.config import settings

logger = logging.getLogger(__name__)

_pool: redis.ConnectionPool | None = None


def get_redis() -> redis.Redis:
    """Get a Redis client from the connection pool (lazy-initialized)."""
    global _pool
    if _pool is None:
        _pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=20,
        )
    return redis.Redis(connection_pool=_pool)


def cache_get(key: str) -> Any | None:
    """Read a JSON value from Redis cache. Returns None on miss or error."""
    try:
        r = get_redis()
        raw = r.get(key)
        if raw is not None:
            return json.loads(raw)
    except Exception:
        logger.debug("cache_get failed for key=%s", key, exc_info=True)
    return None


def cache_set(key: str, value: Any, ttl_seconds: int = 300) -> None:
    """Write a JSON value to Redis cache with TTL."""
    try:
        r = get_redis()
        r.setex(key, ttl_seconds, json.dumps(value, default=str))
    except Exception:
        logger.debug("cache_set failed for key=%s", key, exc_info=True)


def cache_delete(pattern: str) -> None:
    """Delete all keys matching a pattern (e.g. 'kpi:org123:*')."""
    try:
        r = get_redis()
        keys = r.keys(pattern)
        if keys:
            r.delete(*keys)
    except Exception:
        logger.debug("cache_delete failed for pattern=%s", pattern, exc_info=True)


def redis_health() -> bool:
    """Check if Redis is reachable."""
    try:
        r = get_redis()
        return r.ping()
    except Exception:
        return False
