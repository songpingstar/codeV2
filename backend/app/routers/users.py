from fastapi import APIRouter, Depends, Query, Path
from pydantic import BaseModel
from typing import Optional
from app.core.response import SuccessResponse

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
    password: str


@router.get("")
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
):
    return SuccessResponse.create(data={
        "total": 5,
        "items": []
    })


@router.post("")
async def create_user(
    user: UserCreate,
):
    return SuccessResponse.create(data={
        "id": 1,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "status": "active",
        "created_at": "2026-02-28 10:00:00"
    })


@router.put("/{id}")
async def update_user(
    id: int = Path(..., ge=1),
    user: UserUpdate = None,
):
    return SuccessResponse.create(data={
        "id": id,
        "username": "test",
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "updated_at": "2026-02-28 10:00:00"
    })


@router.delete("/{id}")
async def delete_user(
    id: int = Path(..., ge=1),
):
    return SuccessResponse.create(data=None)


@router.put("/{id}/reset-password")
async def reset_user_password(
    id: int = Path(..., ge=1),
    request: PasswordReset = None,
):
    return SuccessResponse.create(data=None)


@router.put("/me/change-password")
async def change_my_password(
    request: PasswordChange = None,
):
    return SuccessResponse.create(data=None)
