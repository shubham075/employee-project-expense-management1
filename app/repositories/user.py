from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    searchable_fields = ("email", "username", "full_name")

    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_by_username_or_email(self, value: str) -> User | None:
        result = self.db.execute(
            select(User).where(
                User.is_deleted.is_(False),
                or_(User.email == value, User.username == value),
            )
        )
        return result.scalars().first()

