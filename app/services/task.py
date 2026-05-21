from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.task import Task
from app.models.user import User
from app.repositories.task import TaskRepository
from app.schemas.common import ListParams
from app.schemas.task import TaskCreate, TaskStatusUpdate, TaskUpdate
from app.utils.notifications import create_notification


class TaskService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TaskRepository(db)

    def list_tasks(self, params: ListParams) -> tuple[list[Task], int]:
        return self.repo.list(params)

    def get_task(self, task_id: int) -> Task:
        task = self.repo.get_by_id(task_id)
        if not task:
            raise AppException("Task not found", status_code=404)
        return task

    def create_task(self, payload: TaskCreate, actor: User) -> Task:
        data = payload.model_dump()
        data["created_by_id"] = actor.id
        task = self.repo.create(data)
        create_notification(self.db, task.assigned_to_id, "New task assigned", task.title, "task")
        self.db.commit()
        return task

    def update_task(self, task_id: int, payload: TaskUpdate, actor: User) -> Task:
        task = self.get_task(task_id)
        data = payload.model_dump(exclude_unset=True)
        data["updated_by_id"] = actor.id
        updated = self.repo.update(task, data)
        self.db.commit()
        return updated

    def update_status(self, task_id: int, payload: TaskStatusUpdate, actor: User) -> Task:
        task = self.get_task(task_id)
        if actor.role.name == "Employee" and task.assigned_to_id != actor.id:
            raise AppException("Cannot update another employee's task", status_code=403)
        updated = self.repo.update(task, {"status": payload.status, "updated_by_id": actor.id})
        self.db.commit()
        return updated

    def delete_task(self, task_id: int, actor: User) -> None:
        task = self.get_task(task_id)
        task.updated_by_id = actor.id
        task.deleted_at = datetime.now(timezone.utc)
        self.repo.soft_delete(task)
        self.db.commit()

