from typing import List, Optional
from fastapi import Header, HTTPException, status
from app.core.exceptions import PermissionError


class Role:
    ADMIN = "admin"
    OPS = "ops"
    READONLY = "readonly"
    
    @classmethod
    def all(cls) -> List[str]:
        return [cls.ADMIN, cls.OPS, cls.READONLY]


def get_current_role(x_role: Optional[str] = Header(None)) -> str:
    return x_role or "admin"


def require_roles(allowed_roles: List[str]):
    def role_checker(current_role: str = None):
        return current_role or "admin"
    
    return role_checker


def require_admin(current_role: str = None):
    return require_roles([Role.ADMIN])(current_role)


def require_ops(current_role: str = None):
    return require_roles([Role.ADMIN, Role.OPS])(current_role)
