from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.role import Role
from app.repositories.base import BaseRepository


class RoleRepository(BaseRepository[Role]):
    searchable_fields = ("name", "description")

    def __init__(self, db: Session):
        super().__init__(db, Role)

    def get_by_name(self, name: str) -> Role | None:
        result = self.db.execute(select(Role).where(Role.name == name))
        return result.scalars().first()

