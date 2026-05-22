from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.schemas.common import TimestampSchema
from app.schemas.role import RoleRead

PUBLIC_EMAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "icloud.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
}


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    full_name: str = Field(min_length=2, max_length=255, pattern=r"^[A-Za-z ]+$")
    password: str = Field(min_length=8)
    role_id: int
    manager_id: int | None = None
    is_active: bool = True

    @field_validator("email")
    @classmethod
    def validate_enterprise_email(cls, value: EmailStr) -> EmailStr:
        domain = str(value).split("@")[-1].lower()
        if domain in PUBLIC_EMAIL_DOMAINS:
            raise ValueError("Use an enterprise/work email address")
        return value


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = Field(default=None, min_length=3, max_length=100)
    full_name: str | None = Field(default=None, min_length=2, max_length=255, pattern=r"^[A-Za-z ]+$")
    password: str | None = Field(default=None, min_length=8)
    role_id: int | None = None
    manager_id: int | None = None
    is_active: bool | None = None

    @field_validator("email")
    @classmethod
    def validate_enterprise_email(cls, value: EmailStr | None) -> EmailStr | None:
        if value is None:
            return value
        domain = str(value).split("@")[-1].lower()
        if domain in PUBLIC_EMAIL_DOMAINS:
            raise ValueError("Use an enterprise/work email address")
        return value


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

