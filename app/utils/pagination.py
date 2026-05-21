from math import ceil

from app.schemas.common import PageMeta, PaginatedResponse


def build_paginated_response(items: list, total: int, page: int, size: int) -> PaginatedResponse:
    return PaginatedResponse(
        items=items,
        meta=PageMeta(page=page, size=size, total=total, pages=ceil(total / size) if total else 0),
    )

