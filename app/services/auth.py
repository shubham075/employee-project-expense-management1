from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.auth.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import logger
from app.models.password_reset import PasswordResetToken
from app.models.session import UserSession
from app.models.user import User
from app.repositories.password_reset import PasswordResetRepository
from app.repositories.session import SessionRepository
from app.repositories.user import UserRepository
from app.schemas.auth import ForgotPasswordResponse, LoginRequest, RegisterRequest, TokenPair
from app.utils.tokens import generate_secure_token, hash_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.sessions = SessionRepository(db)
        self.password_resets = PasswordResetRepository(db)

    def register(self, payload: RegisterRequest) -> User:
        existing = self.users.get_by_username_or_email(payload.email)
        if existing or self.users.get_by_username_or_email(payload.username):
            raise AppException("User already exists", status_code=409)
        user = self.users.create(
            {
                "email": payload.email,
                "username": payload.username,
                "full_name": payload.full_name,
                "hashed_password": hash_password(payload.password),
                "role_id": payload.role_id,
                "manager_id": payload.manager_id,
            }
        )
        self.db.commit()
        return user

    def login(self, payload: LoginRequest, ip_address: str | None, user_agent: str | None) -> TokenPair:
        user = self.users.get_by_username_or_email(payload.username_or_email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise AppException("Invalid credentials", status_code=401)
        if not user.is_active:
            raise AppException("User is inactive", status_code=403)

        role_name = user.role.name if user.role else None
        access_token = create_access_token(user.id, role=role_name)
        refresh_token, jti, expires_at = create_refresh_token(user.id, role=role_name)
        session = UserSession(
            user_id=user.id,
            refresh_token_jti=jti,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(session)
        self.db.commit()
        return TokenPair(access_token=access_token, refresh_token=refresh_token)

    def refresh(self, refresh_token: str) -> TokenPair:
        payload = decode_token(refresh_token, expected_type="refresh")
        session = self.sessions.get_active_by_jti(payload.jti)
        if not session:
            raise AppException("Refresh session is invalid", status_code=401)

        user = self.users.get_by_id(int(payload.sub))
        if not user:
            raise AppException("User not found", status_code=401)

        role_name = user.role.name if user.role else None
        new_access_token = create_access_token(user.id, role=role_name)
        new_refresh_token, new_jti, expires_at = create_refresh_token(user.id, role=role_name)
        session.revoked_at = datetime.now(timezone.utc)
        self.db.add(
            UserSession(
                user_id=user.id,
                refresh_token_jti=new_jti,
                expires_at=expires_at,
            )
        )
        self.db.commit()
        return TokenPair(access_token=new_access_token, refresh_token=new_refresh_token)

    def logout(self, refresh_token: str) -> None:
        payload = decode_token(refresh_token, expected_type="refresh")
        session = self.sessions.get_active_by_jti(payload.jti)
        if session:
            session.revoked_at = datetime.now(timezone.utc)
            self.db.commit()

    def forgot_password(self, email: str) -> ForgotPasswordResponse:
        user = self.users.get_by_username_or_email(email)
        if not user or user.is_deleted or not user.is_active:
            # Keep this endpoint enumeration-safe.
            return ForgotPasswordResponse()

        self.password_resets.revoke_active_for_user(user.id)
        raw_token = generate_secure_token()
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(raw_token),
            expires_at=datetime.now(timezone.utc)
            + timedelta(minutes=settings.password_reset_token_expire_minutes),
        )
        self.db.add(reset_token)
        self.db.commit()

        reset_link = f"{settings.frontend_reset_password_url}?token={raw_token}"
        logger.info("Password reset link generated for user_id=%s: %s", user.id, reset_link)

        if settings.environment.lower() in {"development", "local", "test"}:
            return ForgotPasswordResponse(reset_link=reset_link, reset_token=raw_token)
        return ForgotPasswordResponse()

    def reset_password(self, token: str, new_password: str) -> None:
        reset_token = self.password_resets.get_active_by_hash(hash_token(token))
        if not reset_token:
            raise AppException("Invalid or expired password reset token", status_code=400)

        user = self.users.get_by_id(reset_token.user_id)
        if not user or user.is_deleted or not user.is_active:
            raise AppException("User is inactive or missing", status_code=400)

        user.hashed_password = hash_password(new_password)
        reset_token.used_at = datetime.now(timezone.utc)

        # Invalidate existing refresh-token sessions after credential change.
        self.sessions.revoke_active_for_user(user.id)

        self.db.commit()
