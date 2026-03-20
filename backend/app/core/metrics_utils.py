"""Shared metric helpers used by multiple route modules."""

from app.core.config import settings


def cap_delta(delta_seconds: float) -> int:
    """Clamp an inter-event gap to ``[0, METRICS_MAX_GAP_SECONDS]``.

    Large gaps (e.g. laptop sleep) would skew aggregated metrics, so we cap
    them at ``settings.METRICS_MAX_GAP_SECONDS``.
    """
    if delta_seconds <= 0:
        return 0
    if delta_seconds > settings.METRICS_MAX_GAP_SECONDS:
        return settings.METRICS_MAX_GAP_SECONDS
    return int(delta_seconds)
