from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, condecimal

from app.schemas.common import AuditSchema, TimestampSchema

MoneyDecimal = condecimal(
    gt=0,
    max_digits=10,
    decimal_places=2
)

class ExpenseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    amount: MoneyDecimal #= Field(gt=0, max_digits=10, decimal_places=2)
    category: str = Field(min_length=2, max_length=100)
    expense_date: date
    project_id: int | None = None


class ExpenseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    amount: MoneyDecimal # | None = Field(default=None, gt=0, decimal_places=2)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    expense_date: date | None = None
    project_id: int | None = None


class ExpenseDecision(BaseModel):
    status: str = Field(pattern="^(approved|rejected)$")


class ExpenseRead(TimestampSchema, AuditSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    amount: Decimal
    category: str
    status: str
    expense_date: date
    bill_file_path: str | None = None
    project_id: int | None = None
    employee_id: int
    approved_by_id: int | None = None

