from datetime import datetime, timedelta, timezone
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.exceptions import AppException
from app.schemas.auth import TokenPayload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_token(subject: int, token_type: str, expires_delta: timedelta, role: str | None = None) -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    jti = uuid4().hex
    payload = {
        "sub": str(subject),
        "jti": jti,
        "type": token_type,
        "role": role,
        "iat": now,
        "exp": now + expires_delta,
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, jti


def create_access_token(subject: int, role: str | None = None) -> str:
    token, _ = create_token(
        subject=subject,
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        role=role,
    )
    return token


def create_refresh_token(subject: int, role: str | None = None) -> tuple[str, str, datetime]:
    expires_delta = timedelta(days=settings.refresh_token_expire_days)
    token, jti = create_token(subject=subject, token_type="refresh", expires_delta=expires_delta, role=role)
    return token, jti, datetime.now(timezone.utc) + expires_delta


def decode_token(token: str, expected_type: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        token_type = payload.get("type")
        if token_type != expected_type:
            raise AppException("Invalid token type", status_code=401)
        return TokenPayload(
            sub=str(payload["sub"]),
            jti=str(payload["jti"]),
            token_type=token_type,
            role=payload.get("role"),
        )
    except (JWTError, KeyError) as exc:
        raise AppException("Invalid or expired token", status_code=401) from exc

