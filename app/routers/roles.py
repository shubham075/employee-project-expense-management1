from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.rbac import ADMIN, require_roles
from app.core.database import get_db
from app.dependencies.pagination import get_list_params
from app.schemas.common import APIResponse, ListParams, PaginatedResponse
from app.schemas.role import RoleCreate, RoleRead, RoleUpdate
from app.services.role import RoleService
from app.utils.pagination import build_paginated_response
from app.utils.responses import success_response

router = APIRouter(prefix="/roles", tags=["Roles"], dependencies=[Depends(require_roles(ADMIN))])


@router.get("", response_model=APIResponse[PaginatedResponse[RoleRead]])
def list_roles(params: ListParams = Depends(get_list_params), db: Session = Depends(get_db)):
    roles, total = RoleService(db).list_roles(params)
    data = build_paginated_response([RoleRead.model_validate(role) for role in roles], total, params.page, params.size)
    return success_response(data)


@router.post("", response_model=APIResponse[RoleRead], status_code=status.HTTP_201_CREATED)
def create_role(payload: RoleCreate, db: Session = Depends(get_db)):
    role = RoleService(db).create_role(payload)
    return success_response(RoleRead.model_validate(role), "Role created")


@router.get("/{role_id}", response_model=APIResponse[RoleRead])
def get_role(role_id: int, db: Session = Depends(get_db)):
    role = RoleService(db).get_role(role_id)
    return success_response(RoleRead.model_validate(role))


@router.put("/{role_id}", response_model=APIResponse[RoleRead])
def update_role(role_id: int, payload: RoleUpdate, db: Session = Depends(get_db)):
    role = RoleService(db).update_role(role_id, payload)
    return success_response(RoleRead.model_validate(role), "Role updated")


@router.delete("/{role_id}", response_model=APIResponse[None])
def delete_role(role_id: int, db: Session = Depends(get_db)):
    RoleService(db).delete_role(role_id)
    return success_response(None, "Role deleted")
