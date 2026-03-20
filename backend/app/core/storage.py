"""
Storage abstraction layer.

Supports two drivers:
  - ``local``  – plain filesystem (default, zero-config)
  - ``s3``     – any S3-compatible service (AWS S3, MinIO, R2, etc.)

Usage is via the module-level ``storage`` singleton:

    from app.core.storage import storage
    path, size, sha = storage.save(file, org_id, session_id, recording_id)
    data           = storage.read(path)
    storage.delete(path)
"""

from __future__ import annotations

import hashlib
import io
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO

from fastapi import UploadFile

from app.core.config import settings

CHUNK_SIZE = 1024 * 1024  # 1 MB


class StorageError(ValueError):
    """Raised when a storage operation fails."""


# ── helpers ─────────────────────────────────────────────────────


def _safe_suffix(filename: str | None) -> str:
    if not filename:
        return ".bin"
    suffix = Path(filename).suffix
    if not suffix or len(suffix) > 10:
        return ".bin"
    return suffix


def _object_key(org_id: str, session_id: str, recording_id: str, suffix: str) -> str:
    """Build a deterministic key used by both drivers."""
    return f"{org_id}/{session_id}/{recording_id}{suffix}"


def _hash_stream(stream: BinaryIO) -> tuple[bytes, int, str]:
    """Read *stream* fully and return ``(bytes_content, size, sha256_hex)``."""
    hasher = hashlib.sha256()
    buf = io.BytesIO()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    total = 0
    while True:
        chunk = stream.read(CHUNK_SIZE)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise StorageError("Upload exceeds size limit")
        buf.write(chunk)
        hasher.update(chunk)
    return buf.getvalue(), total, hasher.hexdigest()


# ── abstract driver ─────────────────────────────────────────────


class StorageDriver(ABC):
    """Interface every driver must implement."""

    @abstractmethod
    def save(
        self,
        file: UploadFile,
        org_id: str,
        session_id: str,
        recording_id: str,
    ) -> tuple[str, int, str]:
        """Persist *file* and return ``(path_or_key, size_bytes, sha256_hex)``."""

    @abstractmethod
    def read(self, path: str) -> bytes:
        """Return the raw file content."""

    @abstractmethod
    def delete(self, path: str) -> None:
        """Remove the file. Must not raise if already absent."""

    @abstractmethod
    def exists(self, path: str) -> bool:
        """Check whether the file exists."""

    @abstractmethod
    def get_download_path(self, path: str) -> str | None:
        """Return a local filesystem path suitable for ``FileResponse``, or ``None``
        if the driver cannot serve files from the local filesystem (e.g. S3)."""


# ── local driver ────────────────────────────────────────────────


class LocalDriver(StorageDriver):
    """Filesystem-backed driver (development & small deployments)."""

    def __init__(self, base_path: str) -> None:
        self._base = Path(base_path).resolve()

    def save(
        self,
        file: UploadFile,
        org_id: str,
        session_id: str,
        recording_id: str,
    ) -> tuple[str, int, str]:
        suffix = _safe_suffix(file.filename)
        key = _object_key(org_id, session_id, recording_id, suffix)
        target = self._base / key
        target.parent.mkdir(parents=True, exist_ok=True)

        hasher = hashlib.sha256()
        total = 0
        max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024

        with target.open("wb") as fh:
            while True:
                chunk = file.file.read(CHUNK_SIZE)
                if not chunk:
                    break
                total += len(chunk)
                if total > max_bytes:
                    target.unlink(missing_ok=True)
                    raise StorageError("Upload exceeds size limit")
                fh.write(chunk)
                hasher.update(chunk)

        return str(target), total, hasher.hexdigest()

    def read(self, path: str) -> bytes:
        p = Path(path)
        if not p.exists():
            raise StorageError(f"File not found: {path}")
        return p.read_bytes()

    def delete(self, path: str) -> None:
        Path(path).unlink(missing_ok=True)

    def exists(self, path: str) -> bool:
        return Path(path).exists()

    def get_download_path(self, path: str) -> str | None:
        p = Path(path)
        return str(p) if p.exists() else None


# ── S3 driver ───────────────────────────────────────────────────


class S3Driver(StorageDriver):
    """S3-compatible driver (AWS, MinIO, Cloudflare R2, etc.)."""

    def __init__(self) -> None:
        import boto3

        kwargs: dict = {
            "region_name": settings.S3_REGION,
            "aws_access_key_id": settings.S3_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.S3_SECRET_ACCESS_KEY,
        }
        if settings.S3_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL

        self._client = boto3.client("s3", **kwargs)
        self._bucket = settings.S3_BUCKET_NAME
        self._prefix = settings.S3_PREFIX.strip("/")

    def _full_key(self, key: str) -> str:
        return f"{self._prefix}/{key}" if self._prefix else key

    def save(
        self,
        file: UploadFile,
        org_id: str,
        session_id: str,
        recording_id: str,
    ) -> tuple[str, int, str]:
        suffix = _safe_suffix(file.filename)
        key = _object_key(org_id, session_id, recording_id, suffix)
        full_key = self._full_key(key)

        body, total, sha = _hash_stream(file.file)

        self._client.put_object(
            Bucket=self._bucket,
            Key=full_key,
            Body=body,
            ContentType=file.content_type or "application/octet-stream",
            Metadata={"sha256": sha},
        )

        return full_key, total, sha

    def read(self, path: str) -> bytes:
        try:
            resp = self._client.get_object(Bucket=self._bucket, Key=path)
            return resp["Body"].read()
        except self._client.exceptions.NoSuchKey:
            raise StorageError(f"Object not found: {path}")

    def delete(self, path: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=path)

    def exists(self, path: str) -> bool:
        try:
            self._client.head_object(Bucket=self._bucket, Key=path)
            return True
        except Exception:
            return False

    def get_download_path(self, _path: str) -> str | None:
        # S3 files are not on the local filesystem
        return None

    def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate a presigned URL for direct download from S3."""
        return self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=expires_in,
        )


# ── factory ─────────────────────────────────────────────────────


def _create_driver() -> StorageDriver:
    driver = settings.STORAGE_DRIVER.lower()
    if driver == "local":
        return LocalDriver(settings.STORAGE_PATH)
    if driver == "s3":
        return S3Driver()
    raise StorageError(f"Unknown STORAGE_DRIVER: {driver!r}. Use 'local' or 's3'.")


storage: StorageDriver = _create_driver()


# ── Backward-compatible API ─────────────────────────────────────
# The old ``save_upload`` function is kept so existing callers don't break.


def save_upload(
    file: UploadFile,
    org_id: str,
    session_id: str,
    recording_id: str,
) -> tuple[str, int, str]:
    """Legacy helper – delegates to ``storage.save``."""
    return storage.save(file, org_id, session_id, recording_id)
