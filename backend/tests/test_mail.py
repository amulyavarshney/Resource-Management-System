"""Mail endpoint tests (SMTP)."""

from unittest.mock import AsyncMock, patch

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
        settings.smtp_host = ""
        settings.smtp_from = ""
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


@pytest.mark.asyncio
async def test_mail_sends_via_smtp(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={**MAIL_USER, "email": "smtp.user@example.com"})
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "smtp.user@example.com", "password": MAIL_USER["password"]},
    )
    token = login.json()

    with (
        patch("app.api.v1.routers.mail.get_settings") as gs,
        patch("app.services.mail_service.aiosmtplib.send", new_callable=AsyncMock) as send,
    ):
        settings = gs.return_value
        settings.smtp_host = "smtp.example.com"
        settings.smtp_port = 587
        settings.smtp_username = "user"
        settings.smtp_password = "pass"
        settings.smtp_from = "noreply@example.com"
        settings.smtp_from_name = "RMS"
        settings.smtp_reply_to = ""
        settings.smtp_starttls = True
        settings.smtp_ssl = False

        response = await client.post(
            "/api/v1/mail",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "subject": "Timesheet saved",
                "messageBody": "<p>Hello</p>",
                "recipients": ["smtp.user@example.com"],
            },
        )

    assert response.status_code == 200
    send.assert_awaited_once()
