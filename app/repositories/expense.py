from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    searchable_fields = ("title", "description", "category", "status")

    def __init__(self, db: Session):
        super().__init__(db, Expense)

