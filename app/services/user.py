from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.auth.security import hash_password
from app.core.exceptions import AppException
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.common import ListParams
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def list_users(self, params: ListParams) -> tuple[list[User], int]:
        return self.repo.list(params)

    def get_user(self, user_id: int) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise AppException("User not found", status_code=404)
        return user

    def create_user(self, payload: UserCreate) -> User:
        data = payload.model_dump(exclude={"password"})
        data["hashed_password"] = hash_password(payload.password)
        user = self.repo.create(data)
        self.db.commit()
        return user

    def update_user(self, user_id: int, payload: UserUpdate) -> User:
        user = self.get_user(user_id)
        data = payload.model_dump(exclude_unset=True, exclude={"password"})
        if payload.password:
            data["hashed_password"] = hash_password(payload.password)
        updated = self.repo.update(user, data)
        self.db.commit()
        return updated

    def delete_user(self, user_id: int) -> None:
        user = self.get_user(user_id)
        user.deleted_at = datetime.now(timezone.utc)
        self.repo.soft_delete(user)
        self.db.commit()

