from fastapi import Depends, Header, HTTPException
from typing import Optional, List

ROLE_PERMISSIONS = {
    "admin": ["*"],
    "ops": [
        "dashboard:view",
        "script:create", "script:view", "script:update", "script:execute",
        "task:create", "task:view", "task:update", "task:toggle",
        "execution:view", "execution:log:view",
        "node:view",
        "user:password:change",
        "category:view"
    ],
    "readonly": [
        "dashboard:view",
        "script:view",
        "task:view",
        "execution:view", "execution:log:view",
        "node:view",
        "user:password:change",
        "category:view"
    ]
}


def get_current_user(x_role: Optional[str] = Header(None)) -> dict:
    role = x_role or "admin"
    return {"role": role}


def require_permission(permission: str):
    def permission_checker(user: dict = Depends(get_current_user)):
        user_role = user["role"]
        permissions = ROLE_PERMISSIONS.get(user_role, [])
        if "*" not in permissions and permission not in permissions:
            raise HTTPException(status_code=403, detail="权限不足")
        return user
    return permission_checker


def require_roles(allowed_roles: List[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="权限不足")
        return user
    return role_checker


def get_role_permissions(role: str) -> List[str]:
    return ROLE_PERMISSIONS.get(role, [])
