import pytest
from httpx import AsyncClient


async def _setup(client: AsyncClient, email: str) -> tuple[str, int, int]:
    """Return (token, user_id, project_id)."""
    await client.post("/api/v1/auth/register", json={
        "first_name": "WD", "last_name": "Tester", "email": email,
        "password": "SecureP@ss1", "department": 1, "region": 1,
        "role": 3, "work_hours_per_day": 8, "parent_id": 0,
    })
    token = (await client.post("/api/v1/auth/login", json={"email": email, "password": "SecureP@ss1"})).json()
    headers = {"Authorization": f"Bearer {token}"}

    proj = (await client.post("/api/v1/project", headers=headers,
                              json={"number": f"P{email[:4]}", "title": f"Proj {email[:4]}",
                                    "department": 1, "region": 1})).json()
    users = (await client.get("/api/v1/user", headers=headers)).json()
    uid = next(u["id"] for u in users if u["email"] == email)
    return token, uid, proj["id"]


# ── WeekData ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_weekdata_create_and_get(client: AsyncClient):
    token, uid, pid = await _setup(client, "wd1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    body = {"week1": 10, "week2": 20, "week3": 15, "week4": 5}
    resp = await client.post(f"/api/v1/weekData/{uid}/{pid}/2024/6", headers=headers, json=body)
    assert resp.status_code == 201
    data = resp.json()
    assert data["week1"] == 10
    assert data["week2"] == 20

    get_resp = await client.get(f"/api/v1/weekData/{uid}/{pid}/2024/6", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["week1"] == 10


@pytest.mark.asyncio
async def test_weekdata_upsert(client: AsyncClient):
    token, uid, pid = await _setup(client, "wd2@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    await client.post(f"/api/v1/weekData/{uid}/{pid}/2024/7", headers=headers,
                      json={"week1": 8, "week2": 8, "week3": 8, "week4": 8})
    resp = await client.put(f"/api/v1/weekData/{uid}/{pid}/2024/7", headers=headers,
                            json={"week1": 4, "week2": 4, "week3": 4, "week4": 4})
    assert resp.status_code == 200
    assert resp.json()["week1"] == 4


@pytest.mark.asyncio
async def test_weekdata_get_nonexistent_returns_zeros(client: AsyncClient):
    token, uid, pid = await _setup(client, "wd3@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.get(f"/api/v1/weekData/{uid}/{pid}/2099/12", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["week1"] == 0 and data["week2"] == 0


@pytest.mark.asyncio
async def test_weekdata_by_period(client: AsyncClient):
    token, uid, pid = await _setup(client, "wd4@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.post(f"/api/v1/weekData/{uid}/{pid}/2024/8", headers=headers,
                      json={"week1": 5, "week2": 5, "week3": 5, "week4": 5})
    resp = await client.get("/api/v1/weekData/2024/8", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


# ── Leaves ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_leave_create_and_get(client: AsyncClient):
    token, uid, _ = await _setup(client, "lv1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    body = {"date": "2024-06-03", "type": "Casual", "session": "FullDay", "user_id": uid}
    resp = await client.post("/api/v1/leave", headers=headers, json=body)
    assert resp.status_code == 201
    data = resp.json()
    assert data["user_id"] == uid
    assert data["type"] == 0       # LeaveType.Casual

    get_resp = await client.get(f"/api/v1/leave/{2024}/{6}/{uid}", headers=headers)
    assert get_resp.status_code == 200
    assert len(get_resp.json()) >= 1


@pytest.mark.asyncio
async def test_leave_rejected_on_weekend(client: AsyncClient):
    token, uid, _ = await _setup(client, "lv2@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    # 2024-06-01 is a Saturday
    body = {"date": "2024-06-01", "type": "Casual", "session": "FullDay", "user_id": uid}
    resp = await client.post("/api/v1/leave", headers=headers, json=body)
    assert resp.status_code == 405  # OperationNotSupportedException


@pytest.mark.asyncio
async def test_leave_delete(client: AsyncClient):
    token, uid, _ = await _setup(client, "lv3@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/api/v1/leave", headers=headers,
                      json={"date": "2024-06-04", "type": "Planned", "session": "FullDay", "user_id": uid})
    resp = await client.delete(f"/api/v1/leave/{uid}?date=2024-06-04", headers=headers)
    assert resp.status_code == 200
    assert "deleted" in resp.json()["message"].lower()


@pytest.mark.asyncio
async def test_leave_description_strings(client: AsyncClient):
    """Accept descriptive strings like 'Casual Leave' / 'Full Day' (from C# [Description])."""
    token, uid, _ = await _setup(client, "lv4@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    body = {"date": "2024-06-05", "type": "Casual Leave", "session": "Full Day", "user_id": uid}
    resp = await client.post("/api/v1/leave", headers=headers, json=body)
    assert resp.status_code == 201
