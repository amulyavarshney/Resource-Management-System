import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import promote_to_role


async def _get_token(client: AsyncClient, db_session: AsyncSession, email: str = "bob@example.com") -> str:
    await client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Bob", "last_name": "Jones",
            "email": email, "password": "SecureP@ss1",
            "department": 1, "region": 1, "role": 3,
            "work_hours_per_day": 8, "parent_id": 0,
        },
    )
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "SecureP@ss1"})
    token = resp.json()
    users = (await client.get("/api/v1/user", headers={"Authorization": f"Bearer {token}"})).json()
    uid = next(u["id"] for u in users if u["email"] == email)
    await promote_to_role(db_session, uid, role=3)  # Admin
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "SecureP@ss1"})
    return resp.json()


@pytest.mark.asyncio
async def test_project_crud(client: AsyncClient, db_session: AsyncSession):
    token = await _get_token(client, db_session)
    headers = {"Authorization": f"Bearer {token}"}

    # Create
    resp = await client.post(
        "/api/v1/project",
        json={"number": "P001", "title": "Alpha", "department": 1, "region": 1},
        headers=headers,
    )
    assert resp.status_code == 201
    project_id = resp.json()["id"]

    # Read
    resp = await client.get(f"/api/v1/project/{project_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["number"] == "P001"

    # Update
    resp = await client.patch(
        f"/api/v1/project/{project_id}",
        json={"description": "Updated description"},
        headers=headers,
    )
    assert resp.status_code == 200

    # Delete (schedule) — requires Admin/Developer
    resp = await client.delete(f"/api/v1/project/{project_id}", headers=headers)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_duplicate_project(client: AsyncClient, db_session: AsyncSession):
    token = await _get_token(client, db_session, email="bob2@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"number": "P002", "title": "Beta", "department": 1, "region": 1}
    await client.post("/api/v1/project", json=payload, headers=headers)
    resp = await client.post("/api/v1/project", json=payload, headers=headers)
    assert resp.status_code == 409
