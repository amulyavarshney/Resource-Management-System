import pytest
from httpx import AsyncClient


async def _token(client: AsyncClient, email: str, role: int = 3) -> str:
    await client.post("/api/v1/auth/register", json={
        "first_name": "H", "last_name": "D", "email": email,
        "password": "SecureP@ss1", "department": 1, "region": 1,
        "role": role, "work_hours_per_day": 8, "parent_id": 0,
    })
    return (await client.post("/api/v1/auth/login",
                              json={"email": email, "password": "SecureP@ss1"})).json()


# ── Holidays ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_holiday_create_and_get(client: AsyncClient):
    token = await _token(client, "hol1@example.com")
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
async def test_holiday_duplicate_rejected(client: AsyncClient):
    token = await _token(client, "hol2@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"date": "2024-10-02", "name": "Gandhi Jayanti", "type": 0, "region": 1}
    await client.post("/api/v1/holiday", headers=headers, json=payload)
    resp = await client.post("/api/v1/holiday", headers=headers, json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_holiday_list_shape(client: AsyncClient):
    token = await _token(client, "hol3@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/api/v1/holiday", headers=headers,
                      json={"date": "2024-11-01", "name": "Diwali", "type": 1, "region": 1})
    resp = await client.get("/api/v1/holiday/2024", headers=headers)
    assert resp.status_code == 200
    items = resp.json()
    assert isinstance(items, list)
    assert any(h["name"] == "Diwali" for h in items)


@pytest.mark.asyncio
async def test_holiday_delete(client: AsyncClient):
    token = await _token(client, "hol4@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/api/v1/holiday", headers=headers,
                      json={"date": "2024-12-25", "name": "Christmas", "type": 0, "region": 2})
    resp = await client.delete("/api/v1/holiday?date=2024-12-25&region=2", headers=headers)
    assert resp.status_code == 200


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
async def test_dashboard_project(client: AsyncClient):
    token = await _token(client, "dash3@example.com")
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
