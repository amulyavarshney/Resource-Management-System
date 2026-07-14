from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
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


def role_from_payload(payload: dict) -> Role | None:
    try:
        return Role[payload.get("Role", "")]
    except KeyError:
        return None


def require_roles(*roles: Role):
    """Factory that returns a dependency enforcing at least one of the given roles."""

    async def _check(payload: CurrentUser) -> dict:
        user_role = role_from_payload(payload)
        if user_role is None or user_role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return payload

    return Depends(_check)


AdminOrDeveloper = require_roles(Role.Admin, Role.Developer)
ManagementAndAbove = require_roles(Role.Management, Role.Executive, Role.Admin, Role.Developer)
AllAuthenticated = Depends(get_current_user_payload)


def require_self_or_admin(path_param: str = "id"):
    """Factory that returns a dependency allowing the request only if the
    caller is the user identified by the given path parameter, or an
    Admin/Developer. Requires the JWT's "id" claim, added at token issuance.
    """

    async def _check(request: Request, payload: CurrentUser) -> dict:
        target_id = request.path_params.get(path_param)
        if target_id is not None and str(payload.get("id")) == str(target_id):
            return payload
        if role_from_payload(payload) not in (Role.Admin, Role.Developer):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return payload

    return Depends(_check)


SelfOrAdmin = require_self_or_admin("id")
SelfOrAdminUserId = require_self_or_admin("user_id")


def require_self(path_param: str = "id"):
    """Factory that returns a dependency allowing the request ONLY if the
    caller is the user identified by the given path parameter — no admin
    override. Use for actions where an admin acting on someone else's behalf
    would be unsafe (e.g. removing a password with no recovery path left).
    """

    async def _check(request: Request, payload: CurrentUser) -> dict:
        target_id = request.path_params.get(path_param)
        if target_id is None or str(payload.get("id")) != str(target_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return payload

    return Depends(_check)


SelfOnly = require_self("id")


def assert_admin_or_developer(payload: dict) -> None:
    if role_from_payload(payload) not in (Role.Admin, Role.Developer):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


def assert_self_or_admin(payload: dict, target_user_id: int) -> None:
    if str(payload.get("id")) == str(target_user_id):
        return
    assert_admin_or_developer(payload)


def assert_management_and_above(payload: dict) -> None:
    if role_from_payload(payload) not in (
        Role.Management,
        Role.Executive,
        Role.Admin,
        Role.Developer,
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
