"""Timezone-aware UTC helpers.

``datetime.utcnow()`` is deprecated since Python 3.12.  These utilities
provide a drop-in replacement that works on all supported Python versions.
"""

from datetime import datetime, timezone


def utc_now_naive() -> datetime:
    """Return the current UTC time as a **naive** datetime (tzinfo=None).

    This is equivalent to the deprecated ``datetime.utcnow()`` but uses the
    modern ``datetime.now(timezone.utc)`` under the hood.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)


def utc_now() -> datetime:
    """Return the current UTC time as a **timezone-aware** datetime."""
    return datetime.now(timezone.utc)
