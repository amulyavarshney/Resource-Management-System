from sqlalchemy import Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserFavourite(Base):
    """Per-user favourite project IDs for timesheet filtering."""

    __tablename__ = "UserFavourite"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    project_id: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
