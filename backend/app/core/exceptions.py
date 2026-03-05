from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class BaseError(Exception):
    def __init__(self, code: int, message: str, data: Any = None):
        self.code = code
        self.message = message
        self.data = data
        super().__init__(message)


class ValidationError(BaseError):
    def __init__(self, message: str = "参数验证失败", data: Any = None):
        super().__init__(400, message, data)


class PermissionError(BaseError):
    def __init__(self, message: str = "权限不足", data: Any = None):
        super().__init__(403, message, data)


class NotFoundError(BaseError):
    def __init__(self, message: str = "资源不存在", data: Any = None):
        super().__init__(404, message, data)


class BusinessError(BaseError):
    def __init__(self, message: str = "业务错误", data: Any = None):
        super().__init__(400, message, data)


class DatabaseError(BaseError):
    def __init__(self, message: str = "数据库错误", data: Any = None):
        super().__init__(500, message, data)