"""add timesheet lock table

Revision ID: a1b2c3d4e5f6
Revises: df298917a53e
Create Date: 2026-07-13 16:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "df298917a53e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "TimesheetLock",
        sa.Column("department", sa.Integer(), nullable=False),
        sa.Column("region", sa.Integer(), nullable=False),
        sa.Column("is_locked", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("department", "region"),
    )


def downgrade() -> None:
    op.drop_table("TimesheetLock")
