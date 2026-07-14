import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import promote_to_role


async def _register(client: AsyncClient, email: str) -> tuple[str, int]:
    await client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "A",
            "last_name": "B",
            "email": email,
            "password": "SecureP@ss1",
            "department": 1,
            "region": 1,
            "role": 0,
            "work_hours_per_day": 8,
            "parent_id": 0,
        },
    )
    token = (
        await client.post("/api/v1/auth/login", json={"email": email, "password": "SecureP@ss1"})
    ).json()
    uid = (await client.get("/api/v1/user/me", headers={"Authorization": f"Bearer {token}"})).json()["id"]
    return token, uid


@pytest.mark.asyncio
async def test_weekdata_idor_blocked(client: AsyncClient, db_session: AsyncSession):
    victim_token, victim_uid = await _register(client, "victim@example.com")
    attacker_token, _ = await _register(client, "attacker@example.com")

    # Victim (as admin) creates a project, then writes week data for self
    await promote_to_role(db_session, victim_uid, role=3)
    victim_token = (
        await client.post(
            "/api/v1/auth/login",
            json={"email": "victim@example.com", "password": "SecureP@ss1"},
        )
    ).json()
    victim_headers = {"Authorization": f"Bearer {victim_token}"}
    project = (
        await client.post(
            "/api/v1/project",
            headers=victim_headers,
            json={"number": "IDOR1", "title": "IDOR", "department": 1, "region": 1},
        )
    ).json()
    pid = project["id"]
    await client.post(
        f"/api/v1/weekData/{victim_uid}/{pid}/2024/6",
        headers=victim_headers,
        json={"week1": 8, "week2": 8, "week3": 8, "week4": 8},
    )

    attacker_headers = {"Authorization": f"Bearer {attacker_token}"}
    resp = await client.put(
        f"/api/v1/weekData/{victim_uid}/{pid}/2024/6",
        headers=attacker_headers,
        json={"week1": 99, "week2": 0, "week3": 0, "week4": 0},
    )
    assert resp.status_code == 403

    resp = await client.get(
        f"/api/v1/weekData/{victim_uid}/{pid}/2024/6", headers=attacker_headers
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_leave_idor_blocked(client: AsyncClient):
    victim_token, victim_uid = await _register(client, "lvvictim@example.com")
    attacker_token, _ = await _register(client, "lvattacker@example.com")
    attacker_headers = {"Authorization": f"Bearer {attacker_token}"}

    resp = await client.post(
        "/api/v1/leave",
        headers=attacker_headers,
        json={
            "date": "2024-06-03",
            "type": "Casual",
            "session": "FullDay",
            "user_id": victim_uid,
        },
    )
    assert resp.status_code == 403

    resp = await client.get(
        f"/api/v1/leave/2024/6/{victim_uid}", headers=attacker_headers
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_dashboard_requires_management(client: AsyncClient):
    token, _ = await _register(client, "empdash@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    resp = await client.get("/api/v1/dashboard/2024/6", headers=headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_weekdata_blocked_when_locked(client: AsyncClient, db_session: AsyncSession):
    token, uid = await _register(client, "lockeduser@example.com")
    await promote_to_role(db_session, uid, role=3)
    token = (
        await client.post(
            "/api/v1/auth/login",
            json={"email": "lockeduser@example.com", "password": "SecureP@ss1"},
        )
    ).json()
    headers = {"Authorization": f"Bearer {token}"}
    project = (
        await client.post(
            "/api/v1/project",
            headers=headers,
            json={"number": "LOCK1", "title": "Lock", "department": 1, "region": 1},
        )
    ).json()

    # Demote to employee so lock bypass does not apply
    await promote_to_role(db_session, uid, role=0)
    token = (
        await client.post(
            "/api/v1/auth/login",
            json={"email": "lockeduser@example.com", "password": "SecureP@ss1"},
        )
    ).json()
    emp_headers = {"Authorization": f"Bearer {token}"}

    # Lock as admin via a second privileged account
    admin_token, admin_uid = await _register(client, "lockadmin@example.com")
    await promote_to_role(db_session, admin_uid, role=3)
    admin_token = (
        await client.post(
            "/api/v1/auth/login",
            json={"email": "lockadmin@example.com", "password": "SecureP@ss1"},
        )
    ).json()
    await client.post(
        "/api/v1/lock?is_locked=true",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    resp = await client.post(
        f"/api/v1/weekData/{uid}/{project['id']}/2024/9",
        headers=emp_headers,
        json={"week1": 1, "week2": 1, "week3": 1, "week4": 1},
    )
    assert resp.status_code == 405
    assert "locked" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_personal_holiday_read_idor_blocked(client: AsyncClient, db_session: AsyncSession):
    victim_token, victim_uid = await _register(client, "phvictim@example.com")
    attacker_token, _ = await _register(client, "phattacker@example.com")

    await client.post(
        "/api/v1/holiday",
        headers={"Authorization": f"Bearer {victim_token}"},
        json={
            "date": "2024-10-10",
            "name": "Private Day",
            "type": 1,
            "user_id": victim_uid,
        },
    )

    attacker_headers = {"Authorization": f"Bearer {attacker_token}"}
    resp = await client.get(
        f"/api/v1/holiday/personal?user_id={victim_uid}", headers=attacker_headers
    )
    assert resp.status_code == 403

    resp = await client.get(
        f"/api/v1/holiday/2024?user_id={victim_uid}", headers=attacker_headers
    )
    assert resp.status_code == 403

    # Unscoped personal list is admin-only
    resp = await client.get("/api/v1/holiday/personal", headers=attacker_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_user_directory_idor_blocked(client: AsyncClient):
    victim_token, victim_uid = await _register(client, "udirvictim@example.com")
    attacker_token, _ = await _register(client, "udirattacker@example.com")
    attacker_headers = {"Authorization": f"Bearer {attacker_token}"}

    resp = await client.get("/api/v1/user", headers=attacker_headers)
    assert resp.status_code == 403

    resp = await client.get(f"/api/v1/user/{victim_uid}", headers=attacker_headers)
    assert resp.status_code == 403

    # Self profile remains readable
    me = await client.get(
        "/api/v1/user/me", headers={"Authorization": f"Bearer {victim_token}"}
    )
    assert me.status_code == 200
    assert me.json()["id"] == victim_uid
