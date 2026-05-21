from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.expense import Expense
from app.models.user import User
from app.repositories.expense import ExpenseRepository
from app.schemas.common import ListParams
from app.schemas.expense import ExpenseCreate, ExpenseDecision, ExpenseUpdate
from app.utils.files import save_upload
from app.utils.notifications import create_notification


class ExpenseService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ExpenseRepository(db)

    def list_expenses(self, params: ListParams) -> tuple[list[Expense], int]:
        return self.repo.list(params)

    def get_expense(self, expense_id: int) -> Expense:
        expense = self.repo.get_by_id(expense_id)
        if not expense:
            raise AppException("Expense not found", status_code=404)
        return expense

    def create_expense(self, payload: ExpenseCreate, actor: User) -> Expense:
        data = payload.model_dump()
        data["employee_id"] = actor.id
        data["created_by_id"] = actor.id
        expense = self.repo.create(data)
        self.db.commit()
        return expense

    def update_expense(self, expense_id: int, payload: ExpenseUpdate, actor: User) -> Expense:
        expense = self.get_expense(expense_id)
        if actor.role.name == "Employee" and expense.employee_id != actor.id:
            raise AppException("Cannot update another employee's expense", status_code=403)
        if expense.status != "pending":
            raise AppException("Only pending expenses can be edited", status_code=400)
        data = payload.model_dump(exclude_unset=True)
        data["updated_by_id"] = actor.id
        updated = self.repo.update(expense, data)
        self.db.commit()
        return updated

    def upload_bill(self, expense_id: int, file: UploadFile, actor: User) -> Expense:
        expense = self.get_expense(expense_id)
        if actor.role.name == "Employee" and expense.employee_id != actor.id:
            raise AppException("Cannot upload to another employee's expense", status_code=403)
        path = save_upload(file, "bills")
        updated = self.repo.update(expense, {"bill_file_path": path, "updated_by_id": actor.id})
        self.db.commit()
        return updated

    def decide_expense(self, expense_id: int, payload: ExpenseDecision, actor: User) -> Expense:
        expense = self.get_expense(expense_id)
        updated = self.repo.update(
            expense,
            {
                "status": payload.status,
                "approved_by_id": actor.id,
                "updated_by_id": actor.id,
            },
        )
        create_notification(
            self.db,
            expense.employee_id,
            f"Expense {payload.status}",
            expense.title,
            "expense",
        )
        self.db.commit()
        return updated

    def delete_expense(self, expense_id: int, actor: User) -> None:
        expense = self.get_expense(expense_id)
        expense.updated_by_id = actor.id
        expense.deleted_at = datetime.now(timezone.utc)
        self.repo.soft_delete(expense)
        self.db.commit()

