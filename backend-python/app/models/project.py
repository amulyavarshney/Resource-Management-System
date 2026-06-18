from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_entity import EntityBase


class Project(EntityBase):
    __tablename__ = "Project"

    number: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    business: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[int] = mapped_column(Integer, nullable=False)
    region: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    week_data: Mapped[list["WeekData"]] = relationship(back_populates="project")  # noqa: F821
