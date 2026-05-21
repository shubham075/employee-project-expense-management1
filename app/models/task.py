from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import AuditMixin, SoftDeleteMixin, TimestampMixin


class Task(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="todo", index=True)
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    assigned_to_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    project: Mapped["Project"] = relationship(back_populates="tasks", lazy="selectin")
    assigned_to: Mapped["User"] = relationship(lazy="selectin", foreign_keys=[assigned_to_id])

