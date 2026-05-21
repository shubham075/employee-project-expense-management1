from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.rbac import ADMIN, MANAGER, require_roles
from app.core.database import get_db
from app.dependencies.pagination import get_list_params
from app.models.user import User
from app.schemas.common import APIResponse, ListParams, PaginatedResponse
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project import ProjectService
from app.utils.pagination import build_paginated_response
from app.utils.responses import success_response

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=APIResponse[PaginatedResponse[ProjectRead]], dependencies=[Depends(require_roles(ADMIN, MANAGER))])
def list_projects(params: ListParams = Depends(get_list_params), db: Session = Depends(get_db)):
    projects, total = ProjectService(db).list_projects(params)
    data = build_paginated_response([ProjectRead.model_validate(project) for project in projects], total, params.page, params.size)
    return success_response(data)


@router.post("", response_model=APIResponse[ProjectRead], status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(ADMIN, MANAGER)),
):
    project = ProjectService(db).create_project(payload, actor)
    return success_response(ProjectRead.model_validate(project), "Project created")


@router.get("/{project_id}", response_model=APIResponse[ProjectRead], dependencies=[Depends(require_roles(ADMIN, MANAGER))])
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = ProjectService(db).get_project(project_id)
    return success_response(ProjectRead.model_validate(project))


@router.put("/{project_id}", response_model=APIResponse[ProjectRead])
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(ADMIN, MANAGER)),
):
    project = ProjectService(db).update_project(project_id, payload, actor)
    return success_response(ProjectRead.model_validate(project), "Project updated")


@router.delete("/{project_id}", response_model=APIResponse[None])
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    actor: User = Depends(require_roles(ADMIN)),
):
    ProjectService(db).delete_project(project_id, actor)
    return success_response(None, "Project deleted")

