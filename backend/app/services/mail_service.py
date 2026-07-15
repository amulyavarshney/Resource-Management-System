import base64
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.core.config import Settings
from app.core.exceptions import DomainInvariantException, OperationNotSupportedException
from app.schemas.mail import MailSendRequest

MAX_ATTACHMENTS = 3
MAX_ATTACHMENT_CHARS = 8_000_000


class MailService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def _configured(self) -> bool:
        return bool(self._settings.smtp_host and self._settings.smtp_from)

    async def send(self, body: MailSendRequest, session_email: str) -> None:
        if not self._configured():
            raise OperationNotSupportedException("Mail service is not configured")

        session_email = session_email.strip().lower()
        recipients = [e.strip().lower() for e in body.recipients if e.strip()]
        cc = [e.strip().lower() for e in body.cc if e.strip()]
        bcc = [e.strip().lower() for e in body.bcc if e.strip()]

        if not recipients or len(recipients) > 5:
            raise DomainInvariantException("recipients must contain 1–5 addresses")

        all_targets = [*recipients, *cc, *bcc]
        if any(email != session_email for email in all_targets):
            raise DomainInvariantException("Mail may only be sent to the authenticated user")

        if len(body.attachments) > MAX_ATTACHMENTS:
            raise DomainInvariantException(f"At most {MAX_ATTACHMENTS} attachments are allowed")
        if any(len(a) > MAX_ATTACHMENT_CHARS for a in body.attachments):
            raise DomainInvariantException("Attachment too large")

        message = MIMEMultipart("mixed")
        from_addr = self._settings.smtp_from
        from_name = self._settings.smtp_from_name.strip()
        message["From"] = f"{from_name} <{from_addr}>" if from_name else from_addr
        message["To"] = ", ".join(recipients)
        if cc:
            message["Cc"] = ", ".join(cc)
        message["Subject"] = body.subject
        if self._settings.smtp_reply_to:
            message["Reply-To"] = self._settings.smtp_reply_to

        # Timesheet mail bodies are HTML
        message.attach(MIMEText(body.message_body, "html", "utf-8"))

        for index, raw in enumerate(body.attachments):
            data = raw
            if "," in data and data.lower().startswith("data:"):
                data = data.split(",", 1)[1]
            try:
                payload = base64.b64decode(data, validate=False)
            except Exception as exc:
                raise DomainInvariantException("Invalid attachment encoding") from exc
            part = MIMEApplication(
                payload,
                Name=f"attachment-{index + 1}.xlsx",
            )
            part["Content-Disposition"] = (
                f'attachment; filename="attachment-{index + 1}.xlsx"'
            )
            message.attach(part)

        envelope_to = list(dict.fromkeys([*recipients, *cc, *bcc]))
        try:
            await aiosmtplib.send(
                message,
                hostname=self._settings.smtp_host,
                port=self._settings.smtp_port,
                username=self._settings.smtp_username or None,
                password=self._settings.smtp_password or None,
                sender=from_addr,
                recipients=envelope_to,
                start_tls=self._settings.smtp_starttls,
                use_tls=self._settings.smtp_ssl,
                timeout=30.0,
            )
        except aiosmtplib.SMTPException as exc:
            raise OperationNotSupportedException("Failed to send mail") from exc
        except OSError as exc:
            raise OperationNotSupportedException("Failed to send mail") from exc
