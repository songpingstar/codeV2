from fastapi import APIRouter, Depends, Query, Path
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.response import SuccessResponse
from app.services.user_service import UserService
from app.core.dependencies import require_permission
from database import get_db

router = APIRouter(prefix="/users", tags=["User"])


class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    role: str = "readonly"


class UserUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class PasswordReset(BaseModel):
    password: str = ""


@router.get("")
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("user:view"))
):
    service = UserService(db)
    result = service.get_users(page, size, keyword, role, status)
    return SuccessResponse.create(data=result)


@router.post("")
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("user:create"))
):
    service = UserService(db)
    result = service.create_user(user.model_dump())
    return SuccessResponse.create(data=result)


@router.put("/{id}")
async def update_user(
    id: int = Path(..., ge=1),
    user: UserUpdate = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("user:update"))
):
    service = UserService(db)
    result = service.update_user(id, user.model_dump(exclude_unset=True))
    return SuccessResponse.create(data=result)


@router.delete("/{id}")
async def delete_user(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("user:delete"))
):
    service = UserService(db)
    service.delete_user(id)
    return SuccessResponse.create(data=None)


@router.post("/{id}/password/reset")
async def reset_user_password(
    id: int = Path(..., ge=1),
    request: PasswordReset = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("user:reset"))
):
    service = UserService(db)
    service.reset_password(id, request.password if request else "")
    return SuccessResponse.create(data=None)
