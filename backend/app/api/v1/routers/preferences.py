from fastapi import APIRouter, HTTPException, status

from app.core.deps import AllAuthenticated, CurrentUser, DbSession
from app.schemas.common import MessageResponse
from app.schemas.preferences import FavouritesReplace, FavouritesResponse
from app.services.preferences_service import PreferencesService

router = APIRouter(prefix="/preferences", tags=["preferences"], dependencies=[AllAuthenticated])


def _user_id(payload: dict) -> int:
    raw = payload.get("id")
    if raw is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing user id")
    return int(raw)


@router.get("/favourites", response_model=FavouritesResponse)
async def get_favourites(db: DbSession, payload: CurrentUser) -> FavouritesResponse:
    ids = await PreferencesService(db).list_favourite_project_ids(_user_id(payload))
    return FavouritesResponse(project_ids=ids)


@router.put("/favourites", response_model=FavouritesResponse)
async def replace_favourites(
    body: FavouritesReplace,
    db: DbSession,
    payload: CurrentUser,
) -> FavouritesResponse:
    ids = await PreferencesService(db).replace_favourites(_user_id(payload), body.project_ids)
    return FavouritesResponse(project_ids=ids)


@router.post("/favourites/{project_id}", response_model=FavouritesResponse)
async def add_favourite(
    project_id: int,
    db: DbSession,
    payload: CurrentUser,
) -> FavouritesResponse:
    ids = await PreferencesService(db).add_favourite(_user_id(payload), project_id)
    return FavouritesResponse(project_ids=ids)


@router.delete("/favourites/{project_id}", response_model=FavouritesResponse)
async def remove_favourite(
    project_id: int,
    db: DbSession,
    payload: CurrentUser,
) -> FavouritesResponse:
    ids = await PreferencesService(db).remove_favourite(_user_id(payload), project_id)
    return FavouritesResponse(project_ids=ids)


@router.delete("/favourites", response_model=MessageResponse)
async def clear_favourites(db: DbSession, payload: CurrentUser) -> MessageResponse:
    await PreferencesService(db).replace_favourites(_user_id(payload), [])
    return MessageResponse(message="Favourites cleared")
