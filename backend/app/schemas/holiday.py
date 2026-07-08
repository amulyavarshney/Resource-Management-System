from datetime import date

from pydantic import BaseModel

from app.models.enums import HolidayType, Region


class HolidayCreate(BaseModel):
    date: date
    name: str
    type: HolidayType
    user_id: int | None = None
    region: Region | None = None


class HolidayUpdate(BaseModel):
    name: str | None = None
    type: HolidayType | None = None
    region: Region | None = None
    user_id: int | None = None
    show: bool | None = None


class HolidayResponse(BaseModel):
    model_config = {"from_attributes": True}

    date: date
    name: str
    type: int
    region: int | None = None
    user_id: int | None = None
    show: bool | None = None
