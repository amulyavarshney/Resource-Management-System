from datetime import date

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import HolidayType


class Holiday(Base):
    __tablename__ = "Holiday"

    date: Mapped[date] = mapped_column(Date, primary_key=True, nullable=False)
    region: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[int] = mapped_column(Integer, nullable=False)


class PersonalHoliday(Base):
    __tablename__ = "PersonalHoliday"

    date: Mapped[date] = mapped_column(Date, primary_key=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("User.id"), primary_key=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[int] = mapped_column(Integer, nullable=False)
    show: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    user: Mapped["User"] = relationship(back_populates="personal_holidays")  # noqa: F821
