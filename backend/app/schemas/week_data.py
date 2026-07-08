from pydantic import BaseModel


class WeekDataResponse(BaseModel):
    model_config = {"from_attributes": True}

    week1: int = 0
    week2: int = 0
    week3: int = 0
    week4: int = 0
    week5: int | None = None


class WeekDataUpdate(BaseModel):
    week1: int = 0
    week2: int = 0
    week3: int = 0
    week4: int = 0
    week5: int | None = None
