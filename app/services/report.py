from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.report import DashboardSummary, ExpenseReportRow, ProjectReportRow


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def dashboard_summary(self) -> DashboardSummary:
        total_users = self.db.scalar(select(func.count()).select_from(User).where(User.is_deleted == False))
        total_projects = self.db.scalar(
            select(func.count()).select_from(Project).where(Project.is_deleted == False)
        )
        open_tasks = self.db.scalar(
            select(func.count()).select_from(Task).where(Task.is_deleted == False, Task.status != "done")
        )
        pending_expenses = self.db.scalar(
            select(func.count()).select_from(Expense).where(
                Expense.is_deleted == False,
                Expense.status == "pending",
            )
        )
        approved_total = self.db.scalar(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                Expense.is_deleted == False,
                Expense.status == "approved",
            )
        )
        return DashboardSummary(
            total_users=total_users or 0,
            total_projects=total_projects or 0,
            open_tasks=open_tasks or 0,
            pending_expenses=pending_expenses or 0,
            approved_expense_total=approved_total or Decimal("0.00"),
        )

    def expense_report(self) -> list[ExpenseReportRow]:
        result = self.db.execute(
            select(Expense.status, func.count(Expense.id), func.coalesce(func.sum(Expense.amount), 0))
            .where(Expense.is_deleted == False)
            .group_by(Expense.status)
        )
        return [
            ExpenseReportRow(status=row[0], count=row[1], total_amount=row[2] or Decimal("0.00"))
            for row in result.all()
        ]

    def project_report(self) -> list[ProjectReportRow]:
        result = self.db.execute(
            select(
                Project.id,
                Project.name,
                func.count(Task.id),
                func.coalesce(func.sum(Expense.amount), 0),
            )
            .outerjoin(Task, Task.project_id == Project.id)
            .outerjoin(Expense, Expense.project_id == Project.id)
            .where(Project.is_deleted == False)
            .group_by(Project.id, Project.name)
        )
        return [
            ProjectReportRow(
                project_id=row[0],
                project_name=row[1],
                task_count=row[2],
                expense_total=row[3] or Decimal("0.00"),
            )
            for row in result.all()
        ]
