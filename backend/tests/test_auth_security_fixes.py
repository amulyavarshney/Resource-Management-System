"""Regression tests for the auth/authz vulnerabilities found in the security
audit and fixed afterward. Each test reverses a specific exploit that was
proven live against a running instance before the fix — see the audit
summary and the commit that introduced these fixes for full context.
"""

import pytest
from httpx import AsyncClient

from tests.conftest import promote_to_role


async def _register_and_login(client: AsyncClient, email: str, role: int = 0) -> tuple[str, int]:
    await client.post("/api/v1/auth/register", json={
        "first_name": "Test", "last_name": "User", "email": email,
        "password": "SecureP@ss1", "department": 1, "region": 1,
        "role": role, "work_hours_per_day": 8, "parent_id": 0,
    })
    token = (await client.post("/api/v1/auth/login",
                               json={"email": email, "password": "SecureP@ss1"})).json()
    users = (await client.get("/api/v1/user", headers={"Authorization": f"Bearer {token}"})).json()
    uid = next(u["id"] for u in users if u["email"] == email)
    return token, uid


# ── Fix 1: unauthenticated privilege escalation via self-registration ──────────

@pytest.mark.asyncio
async def test_registration_ignores_client_supplied_role(client: AsyncClient):
    resp = await client.post("/api/v1/auth/register", json={
        "first_name": "Evil", "last_name": "Hacker", "email": "evil@example.com",
        "password": "SecureP@ss1", "department": 1, "region": 1,
        "role": 3,  # Admin — must be ignored
        "work_hours_per_day": 8, "parent_id": 0,
    })
    assert resp.status_code == 200

    token = (await client.post("/api/v1/auth/login",
                               json={"email": "evil@example.com", "password": "SecureP@ss1"})).json()
    users = (await client.get("/api/v1/user", headers={"Authorization": f"Bearer {token}"})).json()
    user = next(u for u in users if u["email"] == "evil@example.com")
    assert user["role"] == 0  # Employee, not Admin


# ── Fix 2: role dependencies actually enforced on privileged routes ────────────

@pytest.mark.asyncio
async def test_employee_cannot_reset_or_import_or_lock(client: AsyncClient):
    token, uid = await _register_and_login(client, "plainemployee@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    assert (await client.delete("/api/v1/project/reset", headers=headers)).status_code == 403
    assert (await client.delete("/api/v1/user/reset", headers=headers)).status_code == 403
    assert (await client.post("/api/v1/lock?is_locked=true", headers=headers)).status_code == 403
    assert (await client.post("/api/v1/user", headers=headers, json={
        "first_name": "X", "last_name": "Y", "email": "shouldfail@example.com",
        "department": 1, "region": 1,
    })).status_code == 403
    assert (await client.post("/api/v1/project", headers=headers, json={
        "number": "NOPE", "title": "Nope", "department": 1, "region": 1,
    })).status_code == 403
    assert (await client.patch("/api/v1/project/1", headers=headers, json={
        "title": "Hacked",
    })).status_code == 403
    assert (await client.post("/api/v1/holiday", headers=headers, json={
        "date": "2024-01-01", "name": "Company Hijack", "type": 0, "region": 1,
    })).status_code == 403
    # Personal holiday for self is still allowed
    assert (await client.post("/api/v1/holiday", headers=headers, json={
        "date": "2024-01-02", "name": "My Holiday", "type": 1, "user_id": uid,
    })).status_code == 201
    # Personal holiday for another user is not
    assert (await client.post("/api/v1/holiday", headers=headers, json={
        "date": "2024-01-03", "name": "Someone Else", "type": 1, "user_id": uid + 999,
    })).status_code == 403


# ── Fix 3: IDOR — cross-user password takeover ──────────────────────────────────

@pytest.mark.asyncio
async def test_cannot_change_another_users_password_without_admin(client: AsyncClient):
    _, attacker_id = await _register_and_login(client, "attacker@example.com")
    _, victim_id = await _register_and_login(client, "victim@example.com")

    attacker_token = (await client.post("/api/v1/auth/login",
                                        json={"email": "attacker@example.com", "password": "SecureP@ss1"})).json()
    headers = {"Authorization": f"Bearer {attacker_token}"}

    # This is the exact exploit proven live: omit old_password, target
    # another user's id — must now be rejected before it ever reaches the
    # password-mismatch check.
    resp = await client.patch(
        f"/api/v1/user/{victim_id}/changePassword",
        json={"new_password": "HackedByAttacker1!"},
        headers=headers,
    )
    assert resp.status_code == 403

    # Victim's original password must still work.
    resp = await client.post("/api/v1/auth/login",
                             json={"email": "victim@example.com", "password": "SecureP@ss1"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_admin_can_reset_another_users_password_without_old_password(client: AsyncClient, db_session):
    admin_token, _ = await _register_and_login(client, "resetadmin@example.com")
    _, target_id = await _register_and_login(client, "lockedout@example.com")

    users = (await client.get("/api/v1/user", headers={"Authorization": f"Bearer {admin_token}"})).json()
    admin_uid = next(u["id"] for u in users if u["email"] == "resetadmin@example.com")
    await promote_to_role(db_session, admin_uid, role=3)
    admin_token = (await client.post("/api/v1/auth/login",
                                     json={"email": "resetadmin@example.com", "password": "SecureP@ss1"})).json()
    headers = {"Authorization": f"Bearer {admin_token}"}

    resp = await client.patch(
        f"/api/v1/user/{target_id}/changePassword",
        json={"new_password": "AdminSetThis1!"},
        headers=headers,
    )
    assert resp.status_code == 200

    resp = await client.post("/api/v1/auth/login",
                             json={"email": "lockedout@example.com", "password": "AdminSetThis1!"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_cannot_remove_another_users_password_even_as_admin(client: AsyncClient, db_session):
    admin_token, admin_id = await _register_and_login(client, "removeadmin@example.com")
    await promote_to_role(db_session, admin_id, role=3)
    admin_token = (await client.post("/api/v1/auth/login",
                                     json={"email": "removeadmin@example.com", "password": "SecureP@ss1"})).json()
    _, target_id = await _register_and_login(client, "removetarget@example.com")

    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = await client.patch(
        f"/api/v1/user/{target_id}/removePassword",
        json={"password": "SecureP@ss1"},
        headers=headers,
    )
    # removePassword is self-only, no admin override — an admin acting on
    # someone else's account here would create an unrecoverable lockout now
    # that passwordless login is disabled.
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_cannot_self_promote_via_profile_update(client: AsyncClient):
    token, uid = await _register_and_login(client, "selfpromote@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Updating your own profile is allowed (SelfOrAdmin passes on self)...
    resp = await client.patch(f"/api/v1/user/{uid}", json={"first_name": "Renamed"}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["first_name"] == "Renamed"

    # ...but setting your own role is not, even though it's your own account.
    resp = await client.patch(f"/api/v1/user/{uid}", json={"role": 3}, headers=headers)  # Admin
    assert resp.status_code == 405  # OperationNotSupportedException


@pytest.mark.asyncio
async def test_admin_can_change_another_users_role(client: AsyncClient, db_session):
    admin_token, admin_id = await _register_and_login(client, "roleadmin@example.com")
    await promote_to_role(db_session, admin_id, role=3)
    admin_token = (await client.post("/api/v1/auth/login",
                                     json={"email": "roleadmin@example.com", "password": "SecureP@ss1"})).json()
    _, target_id = await _register_and_login(client, "rolepromote@example.com")

    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = await client.patch(f"/api/v1/user/{target_id}", json={"role": 1}, headers=headers)  # Management
    assert resp.status_code == 200
    assert resp.json()["role"] == 1  # Management


# ── Fix 4: passwordless login removed ───────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_with_no_password_always_fails_for_local_accounts(client: AsyncClient, db_session):
    token, uid = await _register_and_login(client, "nopwtest@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    await client.patch(f"/api/v1/user/{uid}/removePassword",
                       json={"password": "SecureP@ss1"}, headers=headers)

    resp = await client.post("/api/v1/auth/login", json={"email": "nopwtest@example.com"})
    assert resp.status_code == 401


# ── Fix 8: Google sign-in ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_google_login_requires_internal_secret(client: AsyncClient):
    resp = await client.post("/api/v1/auth/google", json={
        "email": "googleattacker@example.com", "first_name": "A", "last_name": "B",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_google_login_wrong_secret_rejected(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/google",
        json={"email": "googleattacker2@example.com", "first_name": "A", "last_name": "B"},
        headers={"X-Internal-Secret": "wrong-secret"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_google_login_creates_user_with_defaults(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/google",
        json={"email": "new.google@example.com", "first_name": "new", "last_name": "user"},
        headers={"X-Internal-Secret": "test-internal-auth-secret"},
    )
    assert resp.status_code == 200
    token = resp.json()
    assert isinstance(token, str) and len(token) > 20

    users = (
        await client.get("/api/v1/user", headers={"Authorization": f"Bearer {token}"})
    ).json()
    created = next(u for u in users if u["email"] == "new.google@example.com")
    assert created["first_name"] == "New"
    assert created["last_name"] == "User"
    assert created["role"] == 0  # Employee
    assert created["department"] == 1  # GOOGLE_DEFAULT_DEPARTMENT
    assert created["region"] == 1  # GOOGLE_DEFAULT_REGION
    assert created["is_password_protected"] is False


@pytest.mark.asyncio
async def test_google_login_links_existing_user(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Existing",
            "last_name": "User",
            "email": "linked.google@example.com",
            "password": "SecureP@ss1",
            "department": 2,
            "region": 2,
            "role": 0,
            "work_hours_per_day": 8,
            "parent_id": 0,
        },
    )
    resp = await client.post(
        "/api/v1/auth/google",
        json={
            "email": "linked.google@example.com",
            "first_name": "Ignored",
            "last_name": "Name",
        },
        headers={"X-Internal-Secret": "test-internal-auth-secret"},
    )
    assert resp.status_code == 200
    token = resp.json()
    users = (
        await client.get("/api/v1/user", headers={"Authorization": f"Bearer {token}"})
    ).json()
    linked = next(u for u in users if u["email"] == "linked.google@example.com")
    # Existing profile fields are preserved (not overwritten by Google defaults)
    assert linked["first_name"] == "Existing"
    assert linked["department"] == 2
    assert linked["region"] == 2
