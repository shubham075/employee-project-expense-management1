from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import TimestampSchema


class RoleCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    description: str | None = None


class RoleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=50)
    description: str | None = None


class RoleRead(TimestampSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None

