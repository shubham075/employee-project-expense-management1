from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.common import TimestampSchema
from app.schemas.role import RoleRead


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8)
    role_id: int
    manager_id: int | None = None
    is_active: bool = True


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = Field(default=None, min_length=3, max_length=100)
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    password: str | None = Field(default=None, min_length=8)
    role_id: int | None = None
    manager_id: int | None = None
    is_active: bool | None = None


class UserRead(TimestampSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: str
    full_name: str
    is_active: bool
    role_id: int
    manager_id: int | None = None
    role: RoleRead | None = None

