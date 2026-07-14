import pytest
from httpx import AsyncClient


REGISTER_PAYLOAD = {
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice@example.com",
    "password": "SecureP@ss1",
    "department": 1,
    "region": 1,
    "role": 0,
    "work_hours_per_day": 8,
    "parent_id": 0,
}


@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    assert resp.status_code == 200
    assert "successfully" in resp.json()["message"].lower()

    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "alice@example.com", "password": "SecureP@ss1"},
    )
    assert resp.status_code == 200
    token = resp.json()
    assert isinstance(token, str) and len(token) > 10


@pytest.mark.asyncio
async def test_duplicate_register(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    resp = await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "alice@example.com", "password": "WrongP@ss1"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_health_live(client: AsyncClient):
    resp = await client.get("/health/live")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_metrics_endpoint(client: AsyncClient):
    await client.get("/api/v1/auth/login")  # counted (422); health paths are excluded
    resp = await client.get("/metrics")
    assert resp.status_code == 200
    body = resp.text
    assert "rms_http_requests_total" in body
    assert "rms_http_request_duration_seconds" in body
