"""Mail proxy endpoint tests."""

from unittest.mock import patch

import pytest
from httpx import AsyncClient

MAIL_USER = {
    "first_name": "Mail",
    "last_name": "User",
    "email": "mail.user@example.com",
    "password": "SecureP@ss1",
    "department": 1,
    "region": 1,
    "role": 0,
    "work_hours_per_day": 8,
    "parent_id": 0,
}


@pytest.mark.asyncio
async def test_mail_requires_auth(client: AsyncClient):
    response = await client.post(
        "/api/v1/mail",
        json={
            "subject": "Hi",
            "messageBody": "Body",
            "recipients": ["a@example.com"],
        },
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_mail_not_configured_returns_503(client: AsyncClient):
    await client.post("/api/v1/auth/register", json=MAIL_USER)
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": MAIL_USER["email"], "password": MAIL_USER["password"]},
    )
    assert login.status_code == 200
    token = login.json()

    with patch("app.api.v1.routers.mail.get_settings") as gs:
        settings = gs.return_value
        settings.esb_api_url = ""
        settings.esb_sub_key = ""
        response = await client.post(
            "/api/v1/mail",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "subject": "Hi",
                "messageBody": "Body",
                "recipients": [MAIL_USER["email"]],
            },
        )
    assert response.status_code == 503
