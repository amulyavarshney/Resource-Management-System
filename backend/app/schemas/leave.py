from datetime import date

from pydantic import BaseModel

from app.models.enums import LeaveSession, LeaveType


class LeaveCreate(BaseModel):
    date: date
    type: str  # description string e.g. "Casual Leave" — resolved via enum description
    session: str  # description string e.g. "Full Day"
    user_id: int


class LeaveResponse(BaseModel):
    model_config = {"from_attributes": True}

    date: date
    type: int
    session: int
    user_id: int
