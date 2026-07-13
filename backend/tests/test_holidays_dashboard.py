import pytest
from httpx import AsyncClient

from tests.conftest import promote_to_role


async def _token(client: AsyncClient, email: str, role: int = 3) -> str:
    await client.post("/api/v1/auth/register", json={
        "first_name": "H", "last_name": "D", "email": email,
        "password": "SecureP@ss1", "department": 1, "region": 1,
        "role": role, "work_hours_per_day": 8, "parent_id": 0,
    })
    return (await client.post("/api/v1/auth/login",
                              json={"email": email, "password": "SecureP@ss1"})).json()


async def _token_as_admin(client: AsyncClient, db_session, email: str) -> str:
    token = await _token(client, email)
    users = (await client.get("/api/v1/user", headers={"Authorization": f"Bearer {token}"})).json()
    uid = next(u["id"] for u in users if u["email"] == email)
    await promote_to_role(db_session, uid, role=3)  # Admin
    return (await client.post("/api/v1/auth/login",
                              json={"email": email, "password": "SecureP@ss1"})).json()


# ── Holidays ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_holiday_create_and_get(client: AsyncClient, db_session):
    token = await _token_as_admin(client, db_session, "hol1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.post("/api/v1/holiday", headers=headers,
                             json={"date": "2024-08-15", "name": "Independence Day",
                                   "type": 0, "region": 1})
    assert resp.status_code == 201
    assert resp.json()["name"] == "Independence Day"

    get_resp = await client.get("/api/v1/holiday/2024/8", headers=headers)
    assert get_resp.status_code == 200
    names = [h["name"] for h in get_resp.json()]
    assert "Independence Day" in names


@pytest.mark.asyncio
async def test_holiday_duplicate_rejected(client: AsyncClient, db_session):
    token = await _token_as_admin(client, db_session, "hol2@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"date": "2024-10-02", "name": "Gandhi Jayanti", "type": 0, "region": 1}
    await client.post("/api/v1/holiday", headers=headers, json=payload)
    resp = await client.post("/api/v1/holiday", headers=headers, json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_holiday_list_shape(client: AsyncClient, db_session):
    token = await _token_as_admin(client, db_session, "hol3@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/api/v1/holiday", headers=headers,
                      json={"date": "2024-11-01", "name": "Diwali", "type": 1, "region": 1})
    resp = await client.get("/api/v1/holiday/2024", headers=headers)
    assert resp.status_code == 200
    items = resp.json()
    assert isinstance(items, list)
    assert any(h["name"] == "Diwali" for h in items)


@pytest.mark.asyncio
async def test_holiday_delete(client: AsyncClient, db_session):
    token = await _token_as_admin(client, db_session, "hol4@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/api/v1/holiday", headers=headers,
                      json={"date": "2024-12-25", "name": "Christmas", "type": 0, "region": 2})
    resp = await client.delete("/api/v1/holiday?date=2024-12-25&region=2", headers=headers)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_personal_holiday_self_create(client: AsyncClient):
    token = await _token(client, "holpersonal@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    users = (await client.get("/api/v1/user", headers=headers)).json()
    uid = next(u["id"] for u in users if u["email"] == "holpersonal@example.com")

    resp = await client.post("/api/v1/holiday", headers=headers,
                             json={"date": "2024-09-01", "name": "My Day Off",
                                   "type": 1, "user_id": uid})
    assert resp.status_code == 201
    assert resp.json()["user_id"] == uid


# ── Dashboard ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_dashboard_overview(client: AsyncClient):
    token = await _token(client, "dash1@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.get("/api/v1/dashboard/2024/6", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_projects" in data
    assert "total_users" in data
    assert "total_work_hours" in data
    assert "total_int_users" in data
    assert "total_ext_users" in data


@pytest.mark.asyncio
async def test_dashboard_user(client: AsyncClient):
    token = await _token(client, "dash2@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    users = (await client.get("/api/v1/user", headers=headers)).json()
    uid = next(u["id"] for u in users if u["email"] == "dash2@example.com")

    resp = await client.get(f"/api/v1/dashboard/user/{uid}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"] == uid
    assert "first_name" in data
    assert "total_projects" in data


@pytest.mark.asyncio
async def test_dashboard_project(client: AsyncClient, db_session):
    token = await _token_as_admin(client, db_session, "dash3@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    proj = (await client.post("/api/v1/project", headers=headers,
                              json={"number": "DASH1", "title": "Dashboard Test",
                                    "department": 1, "region": 1})).json()
    resp = await client.get(f"/api/v1/dashboard/project/{proj['id']}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["project_id"] == proj["id"]
    assert "total_work_hours" in data


@pytest.mark.asyncio
async def test_health_ready(client: AsyncClient):
    resp = await client.get("/health/ready")
    assert resp.status_code == 200
    assert resp.json()["db"] == "ok"


# ── Lock ──────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_lock_round_trip(client: AsyncClient, db_session):
    # GET /lock is open to any authenticated user; POST /lock (setting the
    # lock) requires Management/Executive/Admin/Developer.
    token = await _token_as_admin(client, db_session, "lock1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.get("/api/v1/lock?department=1&region=1", headers=headers)
    assert resp.status_code == 200
    assert resp.json() is False

    resp = await client.post("/api/v1/lock?is_locked=true&department=1&region=1", headers=headers)
    assert resp.status_code == 200

    resp = await client.get("/api/v1/lock?department=1&region=1", headers=headers)
    assert resp.status_code == 200
    assert resp.json() is True

    # Unrelated department/region combo is unaffected
    resp = await client.get("/api/v1/lock?department=2&region=2", headers=headers)
    assert resp.status_code == 200
    assert resp.json() is False

    resp = await client.post("/api/v1/lock?is_locked=false&department=1&region=1", headers=headers)
    assert resp.status_code == 200

    resp = await client.get("/api/v1/lock?department=1&region=1", headers=headers)
    assert resp.status_code == 200
    assert resp.json() is False
