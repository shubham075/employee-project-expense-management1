from fastapi import Query

from app.schemas.common import ListParams


def get_list_params(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    sort_by: str = Query("id"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    status: str | None = Query(None),
    role_id: int | None = Query(None),
    project_id: int | None = Query(None),
    assigned_to_id: int | None = Query(None),
    employee_id: int | None = Query(None),
    user_id: int | None = Query(None),
) -> ListParams:
    filters = {
        "status": status,
        "role_id": role_id,
        "project_id": project_id,
        "assigned_to_id": assigned_to_id,
        "employee_id": employee_id,
        "user_id": user_id,
    }
    return ListParams(
        page=page,
        size=size,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        filters={key: value for key, value in filters.items() if value is not None},
    )
