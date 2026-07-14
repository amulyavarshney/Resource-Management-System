"""add weekdata and leave query indexes

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-14 16:45:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_WeekData_user_year_month", "WeekData", ["user_id", "year", "month"])
    op.create_index("ix_Leave_user_date", "Leave", ["user_id", "date"])


def downgrade() -> None:
    op.drop_index("ix_Leave_user_date", table_name="Leave")
    op.drop_index("ix_WeekData_user_year_month", table_name="WeekData")
