from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    searchable_fields = ("title", "description", "status", "priority")

    def __init__(self, db: Session):
        super().__init__(db, Task)

