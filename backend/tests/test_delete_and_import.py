from datetime import date, datetime, timedelta, timezone
from io import BytesIO

import openpyxl
import pytest
from httpx import AsyncClient
from sqlalchemy import select

from tests.conftest import _session_factory, promote_to_role


async def _token(client: AsyncClient, email: str, role: int = 3) -> tuple[str, int]:
    """Register (always created as Employee) and log in. `role` is unused —
    kept for call-site compatibility; see _token_as_admin for privileged
    callers."""
    await client.post("/api/v1/auth/register", json={
        "first_name": "D", "last_name": "I", "email": email,
        "password": "SecureP@ss1", "department": 1, "region": 1,
        "role": role, "work_hours_per_day": 8, "parent_id": 0,
    })
    token = (await client.post("/api/v1/auth/login",
                               json={"email": email, "password": "SecureP@ss1"})).json()
    uid = (await client.get("/api/v1/user/me", headers={"Authorization": f"Bearer {token}"})).json()["id"]
    return token, uid


async def _token_as_admin(client: AsyncClient, db_session, email: str) -> tuple[str, int]:
    token, uid = await _token(client, email)
    await promote_to_role(db_session, uid, role=3)  # Admin
    token = (await client.post("/api/v1/auth/login",
                               json={"email": email, "password": "SecureP@ss1"})).json()
    return token, uid


def _xlsx_bytes(headers: list[str], rows: list[list]) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(headers)
    for row in rows:
        ws.append(row)
    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()


# ── Soft-delete regression (User) ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_user_delete_is_soft_not_hard(client: AsyncClient, db_session):
    admin_token, _ = await _token_as_admin(client, db_session, "softdel1admin@example.com")
    _, uid = await _token(client, "softdel1@example.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = await client.delete(f"/api/v1/user/{uid}", headers=headers)
    assert resp.status_code == 200

    async with _session_factory() as db:
        from app.models.user import User
        row = (await db.execute(select(User).where(User.id == uid))).scalar_one_or_none()
        assert row is not None, "user row was hard-deleted"
        assert row.date_deleted is not None
        assert row.date_deleted.date() > date.today()


@pytest.mark.asyncio
async def test_user_delete_now_soft_deletes_immediately(client: AsyncClient, db_session):
    admin_token, _ = await _token_as_admin(client, db_session, "softdel2admin@example.com")
    _, uid = await _token(client, "softdel2@example.com")
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = await client.delete(f"/api/v1/user/{uid}?delete_now=true", headers=headers)
    assert resp.status_code == 200

    async with _session_factory() as db:
        from app.models.user import User
        row = (await db.execute(select(User).where(User.id == uid))).scalar_one_or_none()
        assert row is not None, "user row was hard-deleted"
        assert row.date_deleted is not None
        assert row.date_deleted.date() == datetime.now(timezone.utc).date()


# ── Soft-delete regression (Project) ───────────────────────────────────────────

@pytest.mark.asyncio
async def test_project_delete_is_soft_not_hard(client: AsyncClient, db_session):
    token, _ = await _token_as_admin(client, db_session, "softdel3@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    proj = (await client.post("/api/v1/project", headers=headers,
                              json={"number": "SD1", "title": "Soft Delete Test",
                                    "department": 1, "region": 1})).json()

    resp = await client.delete(f"/api/v1/project/{proj['id']}", headers=headers)
    assert resp.status_code == 200

    async with _session_factory() as db:
        from app.models.project import Project
        row = (await db.execute(select(Project).where(Project.id == proj["id"]))).scalar_one_or_none()
        assert row is not None, "project row was hard-deleted"
        assert row.date_deleted is not None
        assert row.date_deleted.date() > date.today()


# ── Duplicate-project crash regression ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_duplicate_project_number_and_title_cross_match_returns_409(client: AsyncClient, db_session):
    token, _ = await _token_as_admin(client, db_session, "dupcross@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/api/v1/project", headers=headers,
                      json={"number": "CROSS1", "title": "First Title", "department": 1, "region": 1})
    await client.post("/api/v1/project", headers=headers,
                      json={"number": "CROSS2", "title": "Second Title", "department": 1, "region": 1})

    # number matches the first project, title matches the second — used to raise
    # MultipleResultsFound -> 500 instead of the intended 409.
    resp = await client.post("/api/v1/project", headers=headers,
                             json={"number": "CROSS1", "title": "Second Title", "department": 1, "region": 1})
    assert resp.status_code == 409


# ── Duplicate-user crash regression (missing emp_id matches any other null emp_id) ──

@pytest.mark.asyncio
async def test_two_users_without_emp_id_can_both_register(client: AsyncClient):
    await _token(client, "noempid1@example.com")
    # Used to fail with 409 because both users have emp_id=None, and
    # `User.emp_id == data.emp_id` became `emp_id IS NULL`, matching the first user.
    token2, _ = await _token(client, "noempid2@example.com")
    assert token2


# ── Holiday lookup across multiple regions on the same date ────────────────────

@pytest.mark.asyncio
async def test_get_holiday_same_date_multiple_regions_no_region_filter(client: AsyncClient, db_session):
    token, _ = await _token_as_admin(client, db_session, "multiregion@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/api/v1/holiday", headers=headers,
                      json={"date": "2024-01-26", "name": "India Day", "type": 0, "region": 1})
    await client.post("/api/v1/holiday", headers=headers,
                      json={"date": "2024-01-26", "name": "USA Day", "type": 0, "region": 2})

    # Used to raise MultipleResultsFound -> 500 without a region filter.
    resp = await client.get("/api/v1/holiday?date=2024-01-26", headers=headers)
    assert resp.status_code == 200


# ── Personal holiday region filter regression ──────────────────────────────────

@pytest.mark.asyncio
async def test_personal_holiday_region_filter_actually_filters(client: AsyncClient, db_session):
    admin_token, _ = await _token_as_admin(client, db_session, "regionadmin@example.com")
    _, uid_in = await _token(client, "regionin@example.com")
    _, uid_us = await _token(client, "regionus@example.com")

    # uid_us needs USA region — register doesn't take region directly beyond
    # default, so patch it explicitly as admin (changing another user's
    # fields requires Admin/Developer).
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    await client.patch(f"/api/v1/user/{uid_us}", headers=admin_headers, json={"region": 2})

    await client.post("/api/v1/holiday", headers=admin_headers,
                      json={"date": "2024-09-01", "name": "India Personal", "type": 0, "user_id": uid_in})
    await client.post("/api/v1/holiday", headers=admin_headers,
                      json={"date": "2024-09-02", "name": "USA Personal", "type": 0, "user_id": uid_us})

    resp = await client.get("/api/v1/holiday/personal?region=1", headers=admin_headers)
    assert resp.status_code == 200
    names = [h["name"] for h in resp.json()]
    assert "India Personal" in names
    assert "USA Personal" not in names


# ── Excel import ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_import_users_from_excel(client: AsyncClient, db_session):
    token, _ = await _token_as_admin(client, db_session, "importusers@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    xlsx = _xlsx_bytes(
        ["EmpId", "UserName", "FirstName", "LastName", "Email", "Department", "Region", "Role", "WorkHoursPerDay", "ParentId"],
        [[101, "jdoe", "Jane", "Doe", "jane.doe@example.com", "D1", "India", "Employee", 8, 0]],
    )
    resp = await client.post(
        "/api/v1/user/import", headers=headers,
        files={"excelFile": ("users.xlsx", xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert resp.status_code == 201

    users = (await client.get("/api/v1/user", headers=headers)).json()
    imported = next(u for u in users if u["email"] == "jane.doe@example.com")
    assert imported["first_name"] == "Jane"
    assert imported["emp_id"] == 101


@pytest.mark.asyncio
async def test_import_projects_from_excel(client: AsyncClient, db_session):
    token, _ = await _token_as_admin(client, db_session, "importprojects@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    xlsx = _xlsx_bytes(
        ["Number", "Title", "Business", "Department", "Region", "Description"],
        [["IMP1", "Imported Project", "Biz Unit", "D1", "India", "A project"]],
    )
    resp = await client.post(
        "/api/v1/project/import", headers=headers,
        files={"excelFile": ("projects.xlsx", xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert resp.status_code == 201

    projects = (await client.get("/api/v1/project", headers=headers)).json()
    imported = next(p for p in projects if p["number"] == "IMP1")
    assert imported["title"] == "Imported Project"


@pytest.mark.asyncio
async def test_import_company_holidays_from_excel(client: AsyncClient, db_session):
    token, _ = await _token_as_admin(client, db_session, "importholidays@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    xlsx = _xlsx_bytes(
        ["Date", "Name", "Type", "Region"],
        [[date(2024, 12, 25), "Christmas", "Compulsory", "India"]],
    )
    resp = await client.post(
        "/api/v1/holiday/importHolidays", headers=headers,
        files={"excelFile": ("holidays.xlsx", xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert resp.status_code == 201

    holidays = (await client.get("/api/v1/holiday/2024", headers=headers)).json()
    assert any(h["name"] == "Christmas" for h in holidays)


@pytest.mark.asyncio
async def test_import_personal_holidays_from_excel(client: AsyncClient, db_session):
    token, uid = await _token_as_admin(client, db_session, "importpersonal@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    xlsx = _xlsx_bytes(
        ["Date", "Name", "Type", "UserId", "Show"],
        [[date(2024, 11, 1), "Personal Day", "Festival", uid, True]],
    )
    resp = await client.post(
        "/api/v1/holiday/importPersonalHolidays", headers=headers,
        files={"excelFile": ("personal.xlsx", xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert resp.status_code == 201

    holidays = (await client.get(f"/api/v1/holiday/personal?user_id={uid}", headers=headers)).json()
    assert any(h["name"] == "Personal Day" for h in holidays)
