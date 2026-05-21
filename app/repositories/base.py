from typing import Any, Generic, TypeVar

from sqlalchemy import Select, asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.schemas.common import ListParams

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    searchable_fields: tuple[str, ...] = ()

    def __init__(self, db: Session, model: type[ModelType]):
        self.db = db
        self.model = model

    def get_by_id(self, entity_id: int) -> ModelType | None:
        statement = select(self.model).where(self.model.id == entity_id)
        if hasattr(self.model, "is_deleted"):
            statement = statement.where(self.model.is_deleted == False)
        result = self.db.execute(statement)
        return result.scalars().first()

    def list(self, params: ListParams) -> tuple[list[ModelType], int]:
        statement = self._apply_filters(select(self.model), params)
        count_statement = self._apply_filters(select(func.count()).select_from(self.model), params)
        total = (self.db.execute(count_statement)).scalar_one()

        sort_column = getattr(self.model, params.sort_by, getattr(self.model, "id"))
        order = asc(sort_column) if params.sort_order == "asc" else desc(sort_column)
        statement = statement.order_by(order).offset((params.page - 1) * params.size).limit(params.size)

        result = self.db.execute(statement)
        return list(result.scalars().all()), int(total)

    def create(self, data: dict[str, Any]) -> ModelType:
        entity = self.model(**data)
        self.db.add(entity)
        self.db.flush()
        self.db.refresh(entity)
        return entity

    def update(self, entity: ModelType, data: dict[str, Any]) -> ModelType:
        for key, value in data.items():
            setattr(entity, key, value)
        self.db.flush()
        self.db.refresh(entity)
        return entity

    def soft_delete(self, entity: ModelType) -> None:
        if hasattr(entity, "is_deleted"):
            setattr(entity, "is_deleted", True)
        else:
            self.db.delete(entity)
        self.db.flush()

    def _apply_filters(self, statement: Select, params: ListParams) -> Select:
        if hasattr(self.model, "is_deleted"):
            statement = statement.where(self.model.is_deleted == False)

        if params.search and self.searchable_fields:
            search_clauses = [
                getattr(self.model, field).ilike(f"%{params.search}%")
                for field in self.searchable_fields
                if hasattr(self.model, field)
            ]
            if search_clauses:
                statement = statement.where(or_(*search_clauses))

        for field, value in params.filters.items():
            if value is not None and hasattr(self.model, field):
                statement = statement.where(getattr(self.model, field) == value)
        return statement

