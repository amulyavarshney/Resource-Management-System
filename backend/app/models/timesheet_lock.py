from sqlalchemy import Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimesheetLock(Base):
    """Persistent timesheet lock state per department/region.

    department/region use 0 to mean "unspecified" (API query params omitted),
    matching the previous in-memory keying of ``None``.
    """

    __tablename__ = "TimesheetLock"

    department: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    region: Mapped[int] = mapped_column(Integer, primary_key=True, nullable=False)
    is_locked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
