from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import AuditSchema, TimestampSchema


class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    status: str = "todo"
    priority: str = "medium"
    due_date: date | None = None
    project_id: int
    assigned_to_id: int


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    due_date: date | None = None
    project_id: int | None = None
    assigned_to_id: int | None = None


class TaskStatusUpdate(BaseModel):
    status: str


class TaskRead(TimestampSchema, AuditSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    status: str
    priority: str
    due_date: date | None = None
    project_id: int
    assigned_to_id: int

