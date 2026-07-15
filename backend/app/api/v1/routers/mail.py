from fastapi import APIRouter, HTTPException, Request, status

from app.core.config import get_settings
from app.core.deps import AllAuthenticated, CurrentUser
from app.core.exceptions import DomainInvariantException
from app.core.rate_limit import limiter
from app.schemas.common import MessageResponse
from app.schemas.mail import MailSendRequest
from app.services.mail_service import MailService

router = APIRouter(prefix="/mail", tags=["mail"], dependencies=[AllAuthenticated])


@router.post("", response_model=MessageResponse)
@limiter.limit("5/minute")
async def send_mail(
    request: Request,
    body: MailSendRequest,
    payload: CurrentUser,
) -> MessageResponse:
    session_email = str(payload.get("email") or "").strip().lower()
    if not session_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing email",
        )

    settings = get_settings()
    try:
        await MailService(settings).send(body, session_email)
    except DomainInvariantException:
        raise
    except Exception as exc:
        # MailService raises OperationNotSupportedException for config/upstream errors
        detail = str(exc) or "Failed to send mail"
        code = (
            status.HTTP_503_SERVICE_UNAVAILABLE
            if "not configured" in detail.lower()
            else status.HTTP_502_BAD_GATEWAY
        )
        raise HTTPException(status_code=code, detail=detail) from exc

    return MessageResponse(message="Mail sent")
