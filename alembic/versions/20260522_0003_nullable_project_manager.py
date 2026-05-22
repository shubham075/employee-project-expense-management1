"""allow project manager to be optional

Revision ID: 20260522_0003
Revises: 20260520_0002
Create Date: 2026-05-22
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260522_0003"
down_revision: str | None = "20260520_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("projects", "manager_id", existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    op.alter_column("projects", "manager_id", existing_type=sa.Integer(), nullable=False)
