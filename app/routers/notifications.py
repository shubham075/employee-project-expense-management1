from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.rbac import ADMIN, EMPLOYEE, MANAGER, require_roles
from app.core.database import get_db
from app.dependencies.pagination import get_list_params
from app.schemas.common import APIResponse, ListParams, PaginatedResponse
from app.schemas.notification import NotificationCreate, NotificationRead
from app.services.notification import NotificationService
from app.utils.pagination import build_paginated_response
from app.utils.responses import success_response

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=APIResponse[PaginatedResponse[NotificationRead]], dependencies=[Depends(require_roles(ADMIN, MANAGER, EMPLOYEE))])
def list_notifications(params: ListParams = Depends(get_list_params), db: Session = Depends(get_db)):
    notifications, total = NotificationService(db).list_notifications(params)
    data = build_paginated_response(
        [NotificationRead.model_validate(item) for item in notifications],
        total,
        params.page,
        params.size,
    )
    return success_response(data)


@router.post("", response_model=APIResponse[NotificationRead], status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(ADMIN, MANAGER))])
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    notification = NotificationService(db).create_notification(payload)
    return success_response(NotificationRead.model_validate(notification), "Notification created")


@router.patch("/{notification_id}/read", response_model=APIResponse[NotificationRead], dependencies=[Depends(require_roles(ADMIN, MANAGER, EMPLOYEE))])
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notification = NotificationService(db).mark_read(notification_id)
    return success_response(NotificationRead.model_validate(notification), "Notification marked read")

