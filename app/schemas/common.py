from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "OK"
    data: T | None = None


class PageMeta(BaseModel):
    page: int
    size: int
    total: int
    pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    meta: PageMeta


class TimestampSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    created_at: datetime
    updated_at: datetime


class AuditSchema(BaseModel):
    created_by_id: int | None = None
    updated_by_id: int | None = None


class ListParams(BaseModel):
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
    search: str | None = None
    sort_by: str = "id"
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
    filters: dict[str, Any] = Field(default_factory=dict)

