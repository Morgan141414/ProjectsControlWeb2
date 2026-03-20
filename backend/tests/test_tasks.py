"""Task endpoint tests."""

from tests.conftest import API, auth_headers, login_user, register_user


def _setup_org(client):
    """Create an admin user with an org, return (token, org_id)."""
    register_user(client, email="admin@test.com", full_name="Admin")
    login_resp = login_user(client, email="admin@test.com")
    token = login_resp.json()["access_token"]

    org_resp = client.post(
        f"{API}/orgs",
        json={"name": "Task Org"},
        headers=auth_headers(token),
    )
    org_id = org_resp.json()["id"]
    return token, org_id


class TestTasks:
    def test_create_task(self, client):
        token, org_id = _setup_org(client)
        resp = client.post(
            f"{API}/orgs/{org_id}/tasks",
            json={"title": "Test Task", "description": "A test task"},
            headers=auth_headers(token),
        )
        assert resp.status_code == 201
        assert resp.json()["title"] == "Test Task"

    def test_list_tasks(self, client):
        token, org_id = _setup_org(client)
        client.post(
            f"{API}/orgs/{org_id}/tasks",
            json={"title": "Task 1"},
            headers=auth_headers(token),
        )
        client.post(
            f"{API}/orgs/{org_id}/tasks",
            json={"title": "Task 2"},
            headers=auth_headers(token),
        )

        resp = client.get(
            f"{API}/orgs/{org_id}/tasks",
            headers=auth_headers(token),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 2

    def test_update_task_status(self, client):
        token, org_id = _setup_org(client)
        create_resp = client.post(
            f"{API}/orgs/{org_id}/tasks",
            json={"title": "Status Task"},
            headers=auth_headers(token),
        )
        task_id = create_resp.json()["id"]

        resp = client.patch(
            f"{API}/orgs/{org_id}/tasks/{task_id}",
            json={"status": "done"},
            headers=auth_headers(token),
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "done"
