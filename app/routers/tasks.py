from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.rbac import ADMIN, EMPLOYEE, MANAGER, require_roles
from app.core.database import get_db
from app.dependencies.pagination import get_list_params
from app.models.user import User
from app.schemas.common import APIResponse, ListParams, PaginatedResponse
from app.schemas.task import TaskCreate, TaskRead, TaskStatusUpdate, TaskUpdate
from app.services.task import TaskService
from app.utils.pagination import build_paginated_response
from app.utils.responses import success_response

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=APIResponse[PaginatedResponse[TaskRead]], dependencies=[Depends(require_roles(ADMIN, MANAGER, EMPLOYEE))])
def list_tasks(params: ListParams = Depends(get_list_params), db: Session = Depends(get_db)):
    tasks, total = TaskService(db).list_tasks(params)
    data = build_paginated_response([TaskRead.model_validate(task) for task in tasks], total, params.page, params.size)
    return success_response(data)


@router.post("", response_model=APIResponse[TaskRead], status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(ADMIN, MANAGER)),
):
    task = TaskService(db).create_task(payload, actor)
    return success_response(TaskRead.model_validate(task), "Task created")


@router.put("/{task_id}", response_model=APIResponse[TaskRead])
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(ADMIN, MANAGER)),
):
    task = TaskService(db).update_task(task_id, payload, actor)
    return success_response(TaskRead.model_validate(task), "Task updated")


@router.patch("/{task_id}/status", response_model=APIResponse[TaskRead])
def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(ADMIN, MANAGER, EMPLOYEE)),
):
    task = TaskService(db).update_status(task_id, payload, actor)
    return success_response(TaskRead.model_validate(task), "Task status updated")


@router.delete("/{task_id}", response_model=APIResponse[None])
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(ADMIN, MANAGER)),
):
    TaskService(db).delete_task(task_id, actor)
    return success_response(None, "Task deleted")

