from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Enum, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_entity import EntityBase
from app.models.enums import Department, Region, Role


class User(EntityBase):
    __tablename__ = "User"

    emp_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    user_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    password_salt: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    is_external: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # "local" (password login) or "google" (created via Google sign-in, no
    # local password). Set once at creation; never used as a login gate —
    # email match is sufficient for Google sign-in regardless of this value.
    auth_provider: Mapped[str] = mapped_column(String(20), default="local", server_default="local", nullable=False)
    department: Mapped[int] = mapped_column(Integer, nullable=False)
    region: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[int] = mapped_column(Integer, default=Role.Employee, nullable=False)
    work_hours_per_day: Mapped[int] = mapped_column(Integer, default=8, nullable=False)
    parent_id: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_saved_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    personal_holidays: Mapped[list["PersonalHoliday"]] = relationship(back_populates="user")  # noqa: F821
    leaves: Mapped[list["Leave"]] = relationship(back_populates="user")  # noqa: F821
    week_data: Mapped[list["WeekData"]] = relationship(back_populates="user")  # noqa: F821
