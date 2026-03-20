"""Authentication endpoint tests: register, login, refresh, logout, lockout."""

from tests.conftest import API, auth_headers, login_user, register_user


class TestRegister:
    def test_register_success(self, client):
        resp = register_user(client)
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        assert "id" in data

    def test_register_duplicate_email(self, client):
        register_user(client)
        resp = register_user(client)
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"]

    def test_register_weak_password_no_uppercase(self, client):
        resp = client.post(f"{API}/auth/register", json={
            "email": "weak@test.com",
            "password": "testpass1!",
            "full_name": "Weak User",
        })
        assert resp.status_code == 422

    def test_register_weak_password_no_digit(self, client):
        resp = client.post(f"{API}/auth/register", json={
            "email": "weak@test.com",
            "password": "TestPass!!",
            "full_name": "Weak User",
        })
        assert resp.status_code == 422

    def test_register_weak_password_no_special(self, client):
        resp = client.post(f"{API}/auth/register", json={
            "email": "weak@test.com",
            "password": "TestPass11",
            "full_name": "Weak User",
        })
        assert resp.status_code == 422

    def test_register_password_too_short(self, client):
        resp = client.post(f"{API}/auth/register", json={
            "email": "short@test.com",
            "password": "Ts1!",
            "full_name": "Short Pass",
        })
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        register_user(client)
        resp = login_user(client)
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        register_user(client)
        resp = login_user(client, password="WrongPass1!")
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = login_user(client, email="nobody@test.com")
        assert resp.status_code == 401


class TestRefreshToken:
    def test_refresh_success(self, client):
        register_user(client)
        login_resp = login_user(client)
        refresh_token = login_resp.json()["refresh_token"]

        resp = client.post(f"{API}/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        # New refresh token should be different (rotation)
        assert data["refresh_token"] != refresh_token

    def test_refresh_reuse_revoked(self, client):
        register_user(client)
        login_resp = login_user(client)
        refresh_token = login_resp.json()["refresh_token"]

        # First refresh — success
        client.post(f"{API}/auth/refresh", json={"refresh_token": refresh_token})

        # Second refresh with same token — should fail (revoked)
        resp = client.post(f"{API}/auth/refresh", json={"refresh_token": refresh_token})
        assert resp.status_code == 401

    def test_refresh_invalid_token(self, client):
        resp = client.post(f"{API}/auth/refresh", json={
            "refresh_token": "not-a-valid-refresh-token",
        })
        assert resp.status_code == 401


class TestLogout:
    def test_logout_success(self, client):
        register_user(client)
        login_resp = login_user(client)
        refresh_token = login_resp.json()["refresh_token"]

        resp = client.post(f"{API}/auth/logout", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 204

        # Refresh should fail after logout
        resp = client.post(f"{API}/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 401


class TestHealthCheck:
    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_ready(self, client):
        resp = client.get("/ready")
        assert resp.status_code == 200
