from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.enums import Role

_bearer = HTTPBearer()


async def get_current_user_payload(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
) -> dict:
    try:
        payload = decode_access_token(credentials.credentials)
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


CurrentUser = Annotated[dict, Depends(get_current_user_payload)]
DbSession = Annotated[AsyncSession, Depends(get_db)]


def require_roles(*roles: Role):
    """Factory that returns a dependency enforcing at least one of the given roles."""

    async def _check(payload: CurrentUser) -> dict:
        role_str = payload.get("Role", "")
        try:
            user_role = Role[role_str]
        except KeyError:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        if user_role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return payload

    return Depends(_check)


AdminOrDeveloper = require_roles(Role.Admin, Role.Developer)
ManagementAndAbove = require_roles(Role.Management, Role.Executive, Role.Admin, Role.Developer)
AllAuthenticated = Depends(get_current_user_payload)
