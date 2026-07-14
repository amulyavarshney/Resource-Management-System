from datetime import date

from sqlalchemy import Date, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Leave(Base):
    __tablename__ = "Leave"
    __table_args__ = (
        Index("ix_Leave_user_date", "user_id", "date"),
    )

    date: Mapped[date] = mapped_column(Date, primary_key=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("User.id"), primary_key=True, nullable=False)
    type: Mapped[int] = mapped_column(Integer, nullable=False)
    session: Mapped[int] = mapped_column(Integer, nullable=False)

    user: Mapped["User"] = relationship(back_populates="leaves")  # noqa: F821
