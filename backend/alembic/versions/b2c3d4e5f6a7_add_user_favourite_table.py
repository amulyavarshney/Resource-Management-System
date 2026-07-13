"""add user favourite table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-13 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "UserFavourite",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("user_id", "project_id"),
    )
    op.create_index("ix_UserFavourite_user_id", "UserFavourite", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_UserFavourite_user_id", table_name="UserFavourite")
    op.drop_table("UserFavourite")
