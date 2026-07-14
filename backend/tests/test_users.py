import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import promote_to_role


async def _auth(client: AsyncClient, email="user@example.com", role=0) -> tuple[str, int]:
    """Register a user (always created as Employee — self-registration can't
    set a role) and log in. Returns (token, user_id). `role` here only labels
    intent for callers that will separately promote the user via
    promote_to_role — it's not sent anywhere meaningful."""
    await client.post("/api/v1/auth/register", json={
        "first_name": "Test", "last_name": "User",
        "email": email, "password": "SecureP@ss1",
        "department": 1, "region": 1, "role": role,
        "work_hours_per_day": 8, "parent_id": 0,
    })
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "SecureP@ss1"})
    token = resp.json()
    uid = (await client.get("/api/v1/user/me", headers={"Authorization": f"Bearer {token}"})).json()["id"]
    return token, uid


async def _auth_as_admin(client: AsyncClient, db_session: AsyncSession, email: str) -> tuple[str, int]:
    """Register, promote to Admin via direct DB write, then log in again so
    the returned JWT's Role claim reflects the promotion."""
    _, uid = await _auth(client, email)
    await promote_to_role(db_session, uid, role=3)  # Admin
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "SecureP@ss1"})
    return resp.json(), uid


@pytest.mark.asyncio
async def test_get_users_requires_auth(client: AsyncClient):
    resp = await client.get("/api/v1/user")
    # HTTPBearer returns 403 when no credentials provided
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_user_response_is_snake_case(client: AsyncClient):
    token, _ = await _auth(client, "camel@example.com")
    resp = await client.get("/api/v1/user/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    user = resp.json()
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

    # Change password (self-service — must supply the correct old password)
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

    # Remove password (self-service, body-based — query param no longer accepted)
    resp = await client.patch(
        f"/api/v1/user/{uid}/removePassword",
        json={"password": "NewSecureP@ss2"},
        headers=new_headers,
    )
    assert resp.status_code == 200

    # Passwordless login no longer works — the account is unusable until an
    # admin resets its password via changePassword.
    resp = await client.post("/api/v1/auth/login", json={"email": "pwd@example.com"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_managers(client: AsyncClient, db_session):
    token, _ = await _auth_as_admin(client, db_session, "mgr@example.com")
    resp = await client.get("/api/v1/user/managers", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    roles = [u["role"] for u in resp.json()]
    # Employees (0) and Developers (4) should not appear
    assert 0 not in roles


@pytest.mark.asyncio
async def test_delete_user_schedules_deletion(client: AsyncClient, db_session):
    # Deleting a user is Admin/Developer-only — no self-service delete.
    admin_token, _ = await _auth_as_admin(client, db_session, "deladmin@example.com")
    _, target_uid = await _auth(client, "del@example.com")
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = await client.delete(f"/api/v1/user/{target_uid}", headers=headers)
    assert resp.status_code == 200
    assert "deleted" in resp.json()["message"].lower()

    # Confirm this was a soft-delete, not a hard delete: the target row is
    # still present in the DB with a future date_deleted, not gone.
    from datetime import date

    from sqlalchemy import select

    from app.models.user import User

    row = (await db_session.execute(select(User).where(User.id == target_uid))).scalar_one()
    assert row.date_deleted is not None
    assert row.date_deleted.date() > date.today()


@pytest.mark.asyncio
async def test_delete_user_requires_admin(client: AsyncClient):
    token, uid = await _auth(client, "selfdel@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.delete(f"/api/v1/user/{uid}", headers=headers)
    assert resp.status_code == 403
