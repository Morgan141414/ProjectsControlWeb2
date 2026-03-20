import importlib
import os

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-secret-key-for-testing-only")
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    monkeypatch.setenv("ENVIRONMENT", "testing")

    import app.core.config
    import app.db.session
    import app.main

    importlib.reload(app.core.config)
    importlib.reload(app.db.session)
    importlib.reload(app.main)

    with TestClient(app.main.app) as test_client:
        yield test_client


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

API = "/api/v1"


def register_user(client, email="test@example.com", password="TestPass1!", full_name="Test User"):
    return client.post(f"{API}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": full_name,
    })


def login_user(client, email="test@example.com", password="TestPass1!"):
    return client.post(f"{API}/auth/login", data={
        "username": email,
        "password": password,
    })


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
