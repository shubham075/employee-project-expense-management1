from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.password_reset import PasswordResetToken
from app.repositories.base import BaseRepository


class PasswordResetRepository(BaseRepository[PasswordResetToken]):
    def __init__(self, db: Session):
        super().__init__(db, PasswordResetToken)

    def get_active_by_hash(self, token_hash: str) -> PasswordResetToken | None:
        result = self.db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.token_hash == token_hash,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > datetime.now(timezone.utc),
            )
        )
        return result.scalars().first()

    def revoke_active_for_user(self, user_id: int) -> None:
        result = self.db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.user_id == user_id,
                PasswordResetToken.used_at.is_(None),
                PasswordResetToken.expires_at > datetime.now(timezone.utc),
            )
        )
        now = datetime.now(timezone.utc)
        for token in result.scalars().all():
            token.used_at = now
        self.db.flush()
