from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import TimestampSchema


class NotificationCreate(BaseModel):
    user_id: int
    title: str = Field(min_length=2, max_length=255)
    message: str = Field(min_length=2)
    notification_type: str = "info"


class NotificationRead(TimestampSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    read_at: datetime | None = None

