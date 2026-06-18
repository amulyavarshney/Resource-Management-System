import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.models.enums import Department, Region, Role

_PASSWORD_RE = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str | None = None


class UserCreate(BaseModel):
    emp_id: int | None = None
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    email: EmailStr
    password: str | None = Field(default=None, min_length=8, max_length=20)
    department: Department
    region: Region
    role: Role = Role.Employee
    work_hours_per_day: int = Field(default=8, ge=1, le=12)
    parent_id: int = 0

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str | None) -> str | None:
        if v is not None and not _PASSWORD_RE.match(v):
            raise ValueError(
                "Password must be 8-20 chars, contain uppercase, lowercase, digit and special char"
            )
        return v


class UserUpdate(BaseModel):
    emp_id: int | None = None
    user_name: str | None = Field(default=None, max_length=50)
    first_name: str | None = Field(default=None, max_length=50)
    last_name: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    department: Department | None = None
    region: Region | None = None
    role: Role | None = None
    work_hours_per_day: int | None = Field(default=None, ge=1, le=12)
    parent_id: int | None = None
    last_saved_time: datetime | None = None


class PasswordChange(BaseModel):
    old_password: str | None = None
    new_password: str = Field(min_length=8, max_length=20)

    @field_validator("new_password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not _PASSWORD_RE.match(v):
            raise ValueError(
                "Password must be 8-20 chars, contain uppercase, lowercase, digit and special char"
            )
        return v


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    emp_id: int | None
    user_name: str | None
    first_name: str
    last_name: str
    email: str
    is_external: bool
    is_password_protected: bool
    department: int
    region: int
    role: int
    work_hours_per_day: int
    parent_id: int
    last_saved_time: datetime | None
    week1_hours: int | None = None
    week2_hours: int | None = None
    week3_hours: int | None = None
    week4_hours: int | None = None
    week5_hours: int | None = None
