from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.session import UserSession
from app.repositories.base import BaseRepository


class SessionRepository(BaseRepository[UserSession]):
    def __init__(self, db: Session):
        super().__init__(db, UserSession)

    def get_active_by_jti(self, jti: str) -> UserSession | None:
        result = self.db.execute(
            select(UserSession).where(
                UserSession.refresh_token_jti == jti,
                UserSession.revoked_at.is_(None),
                UserSession.expires_at > datetime.now(timezone.utc),
            )
        )
        return result.scalars().first()

    def revoke_active_for_user(self, user_id: int) -> None:
        result = self.db.execute(
            select(UserSession).where(
                UserSession.user_id == user_id,
                UserSession.revoked_at.is_(None),
            )
        )
        now = datetime.now(timezone.utc)
        for session in result.scalars().all():
            session.revoked_at = now
        self.db.flush()
