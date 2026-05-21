from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.rbac import ADMIN, require_roles
from app.core.database import get_db
from app.dependencies.pagination import get_list_params
from app.schemas.common import APIResponse, ListParams, PaginatedResponse
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.user import UserService
from app.utils.pagination import build_paginated_response
from app.utils.responses import success_response

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=APIResponse[PaginatedResponse[UserRead]],
    dependencies=[Depends(require_roles(ADMIN))],
)
def list_users(
    params: ListParams = Depends(get_list_params), db: Session = Depends(get_db)
):
    users, total = UserService(db).list_users(params)
    data = build_paginated_response(
        [UserRead.model_validate(user) for user in users],
        total,
        params.page,
        params.size,
    )
    return success_response(data)


@router.post(
    "",
    response_model=APIResponse[UserRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(ADMIN))],
)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = UserService(db).create_user(payload)
    return success_response(UserRead.model_validate(user), "User created")


@router.get(
    "/{user_id}",
    response_model=APIResponse[UserRead],
    dependencies=[Depends(require_roles(ADMIN))],
)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = UserService(db).get_user(user_id)
    return success_response(UserRead.model_validate(user))


@router.put(
    "/{user_id}",
    response_model=APIResponse[UserRead],
    dependencies=[Depends(require_roles(ADMIN))],
)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = UserService(db).update_user(user_id, payload)
    return success_response(UserRead.model_validate(user), "User updated")


@router.delete(
    "/{user_id}",
    response_model=APIResponse[None],
    dependencies=[Depends(require_roles(ADMIN))],
)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    UserService(db).delete_user(user_id)
    return success_response(None, "User deleted")
