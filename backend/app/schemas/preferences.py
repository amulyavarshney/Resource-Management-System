from pydantic import BaseModel, Field


class FavouritesResponse(BaseModel):
    project_ids: list[int]


class FavouritesReplace(BaseModel):
    project_ids: list[int] = Field(default_factory=list)
