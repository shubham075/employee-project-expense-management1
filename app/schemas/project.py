from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import AuditSchema, TimestampSchema


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    status: str = "active"
    start_date: date | None = None
    end_date: date | None = None
    manager_id: int


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    status: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    manager_id: int | None = None


class ProjectRead(TimestampSchema, AuditSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    status: str
    start_date: date | None = None
    end_date: date | None = None
    manager_id: int

