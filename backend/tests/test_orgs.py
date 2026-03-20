"""Organization endpoint tests."""

from tests.conftest import API, auth_headers, login_user, register_user


def _get_token(client, email="admin@test.com"):
    register_user(client, email=email, full_name="Admin")
    resp = login_user(client, email=email)
    return resp.json()["access_token"]


class TestOrgCreation:
    def test_create_org(self, client):
        token = _get_token(client)
        resp = client.post(
            f"{API}/orgs",
            json={"name": "Test Org"},
            headers=auth_headers(token),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Test Org"
        assert "join_code" in data

    def test_create_org_unauthenticated(self, client):
        resp = client.post(f"{API}/orgs", json={"name": "No Auth Org"})
        assert resp.status_code == 401


class TestOrgJoin:
    def test_join_org_flow(self, client):
        # Admin creates org
        admin_token = _get_token(client, email="admin@test.com")
        org_resp = client.post(
            f"{API}/orgs",
            json={"name": "Join Test Org"},
            headers=auth_headers(admin_token),
        )
        org = org_resp.json()

        # Member registers and requests to join
        register_user(client, email="member@test.com", full_name="Member")
        member_login = login_user(client, email="member@test.com")
        member_token = member_login.json()["access_token"]

        join_resp = client.post(
            f"{API}/orgs/{org['id']}/join-requests",
            json={"org_code": org["join_code"]},
            headers=auth_headers(member_token),
        )
        assert join_resp.status_code == 201
        request_id = join_resp.json()["id"]

        # Admin approves
        approve_resp = client.post(
            f"{API}/orgs/{org['id']}/join-requests/{request_id}/approve",
            headers=auth_headers(admin_token),
        )
        assert approve_resp.status_code == 200
