from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.project import Project
from app.models.user import User
from app.repositories.project import ProjectRepository
from app.schemas.common import ListParams
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ProjectRepository(db)

    def list_projects(self, params: ListParams) -> tuple[list[Project], int]:
        return self.repo.list(params)

    def get_project(self, project_id: int) -> Project:
        project = self.repo.get_by_id(project_id)
        if not project:
            raise AppException("Project not found", status_code=404)
        return project

    def create_project(self, payload: ProjectCreate, actor: User) -> Project:
        data = payload.model_dump()
        data["created_by_id"] = actor.id
        project = self.repo.create(data)
        self.db.commit()
        return project

    def update_project(self, project_id: int, payload: ProjectUpdate, actor: User) -> Project:
        project = self.get_project(project_id)
        data = payload.model_dump(exclude_unset=True)
        data["updated_by_id"] = actor.id
        updated = self.repo.update(project, data)
        self.db.commit()
        return updated

    def delete_project(self, project_id: int, actor: User) -> None:
        project = self.get_project(project_id)
        project.updated_by_id = actor.id
        project.deleted_at = datetime.now(timezone.utc)
        self.repo.soft_delete(project)
        self.db.commit()

