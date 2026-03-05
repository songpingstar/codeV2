from typing import Any, Optional, Generic, TypeVar
from pydantic import BaseModel, Field


T = TypeVar('T')


class ApiResponse(BaseModel, Generic[T]):
    code: int = Field(..., description="响应码")
    message: str = Field(..., description="响应消息")
    data: Optional[T] = Field(None, description="响应数据")
    
    class Config:
        json_schema_extra = {
            "example": {
                "code": 200,
                "message": "success",
                "data": None
            }
        }


class SuccessResponse(ApiResponse[T]):
    @classmethod
    def create(cls, data: T = None, message: str = "success"):
        return cls(code=200, message=message, data=data)


class ErrorResponse(ApiResponse[T]):
    @classmethod
    def create(cls, code: int, message: str, data: T = None):
        return cls(code=code, message=message, data=data)