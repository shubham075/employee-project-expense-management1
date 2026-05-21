from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.rbac import ADMIN, EMPLOYEE, MANAGER, require_roles
from app.core.database import get_db
from app.dependencies.pagination import get_list_params
from app.models.user import User
from app.schemas.common import APIResponse, ListParams, PaginatedResponse
from app.schemas.expense import ExpenseCreate, ExpenseDecision, ExpenseRead, ExpenseUpdate
from app.services.expense import ExpenseService
from app.utils.pagination import build_paginated_response
from app.utils.responses import success_response

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=APIResponse[PaginatedResponse[ExpenseRead]], dependencies=[Depends(require_roles(ADMIN, MANAGER, EMPLOYEE))])
def list_expenses(params: ListParams = Depends(get_list_params), db: Session = Depends(get_db)):
    expenses, total = ExpenseService(db).list_expenses(params)
    data = build_paginated_response([ExpenseRead.model_validate(expense) for expense in expenses], total, params.page, params.size)
    return success_response(data)


@router.post("", response_model=APIResponse[ExpenseRead], status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(EMPLOYEE, MANAGER, ADMIN)),
):
    expense = ExpenseService(db).create_expense(payload, actor)
    return success_response(ExpenseRead.model_validate(expense), "Expense created")


@router.put("/{expense_id}", response_model=APIResponse[ExpenseRead])
def update_expense(
    expense_id: int,
    payload: ExpenseUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(EMPLOYEE, MANAGER, ADMIN)),
):
    expense = ExpenseService(db).update_expense(expense_id, payload, actor)
    return success_response(ExpenseRead.model_validate(expense), "Expense updated")


@router.post("/{expense_id}/bill", response_model=APIResponse[ExpenseRead])
def upload_bill(
    expense_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(EMPLOYEE, MANAGER, ADMIN)),
):
    expense = ExpenseService(db).upload_bill(expense_id, file, actor)
    return success_response(ExpenseRead.model_validate(expense), "Bill uploaded")


@router.patch("/{expense_id}/decision", response_model=APIResponse[ExpenseRead])
def decide_expense(
    expense_id: int,
    payload: ExpenseDecision,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(MANAGER, ADMIN)),
):
    expense = ExpenseService(db).decide_expense(expense_id, payload, actor)
    return success_response(ExpenseRead.model_validate(expense), "Expense decision saved")


@router.delete("/{expense_id}", response_model=APIResponse[None])
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(EMPLOYEE, MANAGER, ADMIN)),
):
    ExpenseService(db).delete_expense(expense_id, actor)
    return success_response(None, "Expense deleted")

