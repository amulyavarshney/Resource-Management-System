from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_favourite import UserFavourite


class PreferencesService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_favourite_project_ids(self, user_id: int) -> list[int]:
        result = await self.db.execute(
            select(UserFavourite.project_id).where(UserFavourite.user_id == user_id)
        )
        return list(result.scalars().all())

    async def add_favourite(self, user_id: int, project_id: int) -> list[int]:
        existing = await self.db.execute(
            select(UserFavourite).where(
                UserFavourite.user_id == user_id,
                UserFavourite.project_id == project_id,
            )
        )
        if existing.scalar_one_or_none() is None:
            self.db.add(UserFavourite(user_id=user_id, project_id=project_id))
            await self.db.flush()
        return await self.list_favourite_project_ids(user_id)

    async def remove_favourite(self, user_id: int, project_id: int) -> list[int]:
        await self.db.execute(
            delete(UserFavourite).where(
                UserFavourite.user_id == user_id,
                UserFavourite.project_id == project_id,
            )
        )
        await self.db.flush()
        return await self.list_favourite_project_ids(user_id)

    async def replace_favourites(self, user_id: int, project_ids: list[int]) -> list[int]:
        await self.db.execute(delete(UserFavourite).where(UserFavourite.user_id == user_id))
        seen: set[int] = set()
        for project_id in project_ids:
            if project_id in seen:
                continue
            seen.add(project_id)
            self.db.add(UserFavourite(user_id=user_id, project_id=project_id))
        await self.db.flush()
        return await self.list_favourite_project_ids(user_id)
