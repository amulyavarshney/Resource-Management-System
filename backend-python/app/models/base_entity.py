from datetime import date, datetime

from sqlalchemy import Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EntityBase(Base):
    __abstract__ = True

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    date_created: Mapped[date] = mapped_column(Date, nullable=False)
    date_modified: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_deleted: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
