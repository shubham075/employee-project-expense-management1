from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import AuditMixin, SoftDeleteMixin, TimestampMixin


class Project(Base, TimestampMixin, SoftDeleteMixin, AuditMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="on-hold", index=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    manager_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)

    manager: Mapped["User"] = relationship(lazy="selectin", foreign_keys=[manager_id])
    tasks: Mapped[list["Task"]] = relationship(back_populates="project")
    expenses: Mapped[list["Expense"]] = relationship(back_populates="project")

