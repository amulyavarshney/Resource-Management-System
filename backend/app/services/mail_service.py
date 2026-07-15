import httpx

from app.core.config import Settings
from app.core.exceptions import DomainInvariantException, OperationNotSupportedException
from app.schemas.mail import MailSendRequest

MAX_ATTACHMENTS = 3
MAX_ATTACHMENT_CHARS = 8_000_000


class MailService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def send(self, body: MailSendRequest, session_email: str) -> None:
        if not self._settings.esb_api_url or not self._settings.esb_sub_key:
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

        payload = {
            "Subject": body.subject,
            "MessageBody": body.message_body,
            "Priority": body.priority or "Normal",
            "Recipients": recipients,
            "CC": cc,
            "BCC": bcc,
            "From": self._settings.esb_mail_from,
            "Sender": self._settings.esb_mail_sender,
            "ReplyTo": self._settings.esb_mail_replyto,
            "ErrorReportDetails": False,
            "SaveAttachmentsExternal": False,
            "Attachments": body.attachments,
            "Callback": {
                "positiveMethod": "Post",
                "positiveUrl": self._settings.esb_callback_positive_url,
                "positiveHeaders": [],
                "negativeMethod": "Get",
                "negativeUrl": self._settings.esb_callback_negative_url,
                "negativeHeaders": [],
            },
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self._settings.esb_api_url,
                    headers={
                        "Content-Type": "application/json",
                        "Cache-Control": "no-cache",
                        "EsbApi-Subscription-Key": self._settings.esb_sub_key,
                    },
                    json=payload,
                )
        except httpx.HTTPError as exc:
            raise OperationNotSupportedException("Failed to send mail") from exc

        if response.status_code >= 400:
            detail = response.text or "ESB mail request failed"
            raise OperationNotSupportedException(detail)
