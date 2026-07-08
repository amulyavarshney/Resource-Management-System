import pytest
from httpx import AsyncClient


async def _auth(client: AsyncClient, email="user@example.com", role=0) -> tuple[str, int]:
    """Register a user and return (token, user_id)."""
    await client.post("/api/v1/auth/register", json={
        "first_name": "Test", "last_name": "User",
        "email": email, "password": "SecureP@ss1",
        "department": 1, "region": 1, "role": role,
        "work_hours_per_day": 8, "parent_id": 0,
    })
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "SecureP@ss1"})
    token = resp.json()
    users = (await client.get("/api/v1/user", headers={"Authorization": f"Bearer {token}"})).json()
    uid = next(u["id"] for u in users if u["email"] == email)
    return token, uid


@pytest.mark.asyncio
async def test_get_users_requires_auth(client: AsyncClient):
    resp = await client.get("/api/v1/user")
    # HTTPBearer returns 403 when no credentials provided
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_user_response_is_snake_case(client: AsyncClient):
    token, _ = await _auth(client, "camel@example.com")
    resp = await client.get("/api/v1/user", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    user = resp.json()[0]
    # Must have snake_case keys
    assert "first_name" in user
    assert "last_name" in user
    assert "is_external" in user
    assert "work_hours_per_day" in user
    assert "is_password_protected" in user
    # Must NOT have camelCase keys
    assert "firstName" not in user
    assert "workHoursPerDay" not in user


@pytest.mark.asyncio
async def test_get_user_by_id(client: AsyncClient):
    token, uid = await _auth(client, "byid@example.com")
    resp = await client.get(f"/api/v1/user/{uid}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["id"] == uid


@pytest.mark.asyncio
async def test_update_user(client: AsyncClient):
    token, uid = await _auth(client, "update@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.patch(f"/api/v1/user/{uid}", json={"user_name": "updated_name"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["user_name"] == "updated_name"


@pytest.mark.asyncio
async def test_change_and_remove_password(client: AsyncClient):
    token, uid = await _auth(client, "pwd@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Change password
    resp = await client.patch(f"/api/v1/user/{uid}/changePassword",
                              json={"old_password": "SecureP@ss1", "new_password": "NewSecureP@ss2"},
                              headers=headers)
    assert resp.status_code == 200

    # Login with new password works
    new_token_resp = await client.post("/api/v1/auth/login",
                                       json={"email": "pwd@example.com", "password": "NewSecureP@ss2"})
    assert new_token_resp.status_code == 200

    new_token = new_token_resp.json()
    new_headers = {"Authorization": f"Bearer {new_token}"}

    # Remove password
    resp = await client.patch(
        f"/api/v1/user/{uid}/removePassword?password=NewSecureP@ss2",
        headers=new_headers
    )
    assert resp.status_code == 200

    # Now login with no password succeeds
    resp = await client.post("/api/v1/auth/login", json={"email": "pwd@example.com"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_managers(client: AsyncClient):
    # Admin role (3) = manager-level
    token, _ = await _auth(client, "mgr@example.com", role=3)
    resp = await client.get("/api/v1/user/managers", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    roles = [u["role"] for u in resp.json()]
    # Employees (0) and Developers (4) should not appear
    assert 0 not in roles


@pytest.mark.asyncio
async def test_delete_user_schedules_deletion(client: AsyncClient):
    token, uid = await _auth(client, "del@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.delete(f"/api/v1/user/{uid}", headers=headers)
    assert resp.status_code == 200
    assert "deleted" in resp.json()["message"].lower()
