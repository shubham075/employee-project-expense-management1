from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories.base import BaseRepository


class ProjectRepository(BaseRepository[Project]):
    searchable_fields = ("name", "description", "status")

    def __init__(self, db: Session):
        super().__init__(db, Project)

