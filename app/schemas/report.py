from decimal import Decimal

from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_users: int
    total_projects: int
    open_tasks: int
    pending_expenses: int
    approved_expense_total: Decimal


class ExpenseReportRow(BaseModel):
    status: str
    count: int
    total_amount: Decimal


class ProjectReportRow(BaseModel):
    project_id: int
    project_name: str
    task_count: int
    expense_total: Decimal
