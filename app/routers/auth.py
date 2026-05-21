from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
)
from app.schemas.common import APIResponse
from app.schemas.user import UserRead
from app.services.auth import AuthService
from app.utils.responses import success_response

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse[UserRead], status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = AuthService(db).register(payload)
        return success_response(UserRead.model_validate(user), "User registered")
    except Exception as exc:
        from app.core.logging import logger
        logger.error("Registration failed: %s", exc, exc_info=True)
        raise



@router.post("/login", response_model=APIResponse[TokenPair])
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    tokens = AuthService(db).login(
        payload,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return success_response(tokens, "Login successful")


@router.post("/refresh", response_model=APIResponse[TokenPair])
def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    tokens = AuthService(db).refresh(payload.refresh_token)
    return success_response(tokens, "Token refreshed")


@router.post("/logout", response_model=APIResponse[None])
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    AuthService(db).logout(payload.refresh_token)
    return success_response(None, "Logout successful")


@router.post("/forgot-password", response_model=APIResponse[ForgotPasswordResponse])
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    data = AuthService(db).forgot_password(str(payload.email))
    return success_response(data, "If the email exists, a password reset link has been generated")


@router.post("/reset-password", response_model=APIResponse[None])
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    AuthService(db).reset_password(payload.token, payload.new_password)
    return success_response(None, "Password reset successful")


@router.get("/me", response_model=APIResponse[UserRead])
def me(current_user: User = Depends(get_current_user)):
    return success_response(UserRead.model_validate(current_user), "Current user")
