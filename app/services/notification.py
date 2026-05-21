from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.notification import Notification
from app.repositories.notification import NotificationRepository
from app.schemas.common import ListParams
from app.schemas.notification import NotificationCreate


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificationRepository(db)

    def list_notifications(self, params: ListParams) -> tuple[list[Notification], int]:
        return self.repo.list(params)

    def create_notification(self, payload: NotificationCreate) -> Notification:
        notification = self.repo.create(payload.model_dump())
        self.db.commit()
        return notification

    def mark_read(self, notification_id: int) -> Notification:
        notification = self.repo.get_by_id(notification_id)
        if not notification:
            raise AppException("Notification not found", status_code=404)
        updated = self.repo.mark_read(notification)
        self.db.commit()
        return updated

