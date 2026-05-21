from typing import Any

from app.schemas.common import APIResponse


def success_response(data: Any = None, message: str = "OK") -> APIResponse[Any]:
    return APIResponse(success=True, message=message, data=data)

