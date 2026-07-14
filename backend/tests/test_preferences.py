import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import promote_to_role


async def _register_and_login(client: AsyncClient, email: str) -> str:
    await client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Fav",
            "last_name": "User",
            "email": email,
            "password": "SecureP@ss1",
            "department": 1,
            "region": 1,
            "role": 0,
            "work_hours_per_day": 8,
            "parent_id": 0,
        },
    )
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "SecureP@ss1"})
    return resp.json()


@pytest.mark.asyncio
async def test_favourites_crud(client: AsyncClient, db_session: AsyncSession):
    token = await _register_and_login(client, "fav@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Empty by default
    resp = await client.get("/api/v1/preferences/favourites", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["project_ids"] == []

    # Need admin to create a project for a realistic id — use promote
    uid = (await client.get("/api/v1/user/me", headers=headers)).json()["id"]
    await promote_to_role(db_session, uid, role=3)
    token = (
        await client.post(
            "/api/v1/auth/login", json={"email": "fav@example.com", "password": "SecureP@ss1"}
        )
    ).json()
    headers = {"Authorization": f"Bearer {token}"}

    project = (
        await client.post(
            "/api/v1/project",
            json={"number": "F001", "title": "Fav Project", "department": 1, "region": 1},
            headers=headers,
        )
    ).json()
    project_id = project["id"]

    # Add
    resp = await client.post(f"/api/v1/preferences/favourites/{project_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["project_ids"] == [project_id]

    # Idempotent add
    resp = await client.post(f"/api/v1/preferences/favourites/{project_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["project_ids"] == [project_id]

    # Replace
    resp = await client.put(
        "/api/v1/preferences/favourites",
        json={"project_ids": [project_id, project_id, 99]},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["project_ids"] == [project_id, 99]

    # Remove
    resp = await client.delete(f"/api/v1/preferences/favourites/{project_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["project_ids"] == [99]

    # Clear
    resp = await client.delete("/api/v1/preferences/favourites", headers=headers)
    assert resp.status_code == 200
    resp = await client.get("/api/v1/preferences/favourites", headers=headers)
    assert resp.json()["project_ids"] == []


@pytest.mark.asyncio
async def test_favourites_requires_auth(client: AsyncClient):
    resp = await client.get("/api/v1/preferences/favourites")
    assert resp.status_code in (401, 403)
