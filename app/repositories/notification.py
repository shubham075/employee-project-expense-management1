from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    searchable_fields = ("title", "message", "notification_type")

    def __init__(self, db: Session):
        super().__init__(db, Notification)

    def mark_read(self, notification: Notification) -> Notification:
        notification.read_at = datetime.now(timezone.utc)
        self.db.flush()
        self.db.refresh(notification)
        return notification
