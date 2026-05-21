from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.role import Role
from app.models.user import User
from app.repositories.role import RoleRepository
from app.schemas.common import ListParams
from app.schemas.role import RoleCreate, RoleUpdate


class RoleService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RoleRepository(db)

    def list_roles(self, params: ListParams) -> tuple[list[Role], int]:
        return self.repo.list(params)

    def get_role(self, role_id: int) -> Role:
        role = self.repo.get_by_id(role_id)
        if not role:
            raise AppException("Role not found", status_code=404)
        return role

    def create_role(self, payload: RoleCreate) -> Role:
        role = self.repo.create(payload.model_dump())
        self.db.commit()
        return role

    def update_role(self, role_id: int, payload: RoleUpdate) -> Role:
        role = self.get_role(role_id)
        updated = self.repo.update(role, payload.model_dump(exclude_unset=True))
        self.db.commit()
        return updated

    def delete_role(self, role_id: int) -> None:
        role = self.get_role(role_id)
        assigned_users = self.db.scalar(select(func.count()).select_from(User).where(User.role_id == role_id))
        if assigned_users:
            raise AppException("Cannot delete a role assigned to users", status_code=409)
        self.db.delete(role)
        self.db.commit()
