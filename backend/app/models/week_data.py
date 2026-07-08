from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WeekData(Base):
    __tablename__ = "WeekData"

    year: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    month: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("User.id"), primary_key=True, nullable=False)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("Project.id"), primary_key=True, nullable=False)

    week1: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    week2: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    week3: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    week4: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    week5: Mapped[int | None] = mapped_column(Integer, nullable=True)

    user: Mapped["User"] = relationship(back_populates="week_data")  # noqa: F821
    project: Mapped["Project"] = relationship(back_populates="week_data")  # noqa: F821
