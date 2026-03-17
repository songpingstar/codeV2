from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
from database import get_db
from app.services.user_service import UserService
from app.core.security import verify_password, create_access_token, get_password_hash, decode_token
from app.core.response import SuccessResponse
from app.core.dependencies import ROLE_PERMISSIONS

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.get_user_by_username(request.username)
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    if user.status != "active":
        raise HTTPException(status_code=403, detail="用户已被禁用")
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(hours=24)
    )
    
    permissions = ROLE_PERMISSIONS.get(user.role, [])
    
    return SuccessResponse.create(data={
        "token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "status": user.status
        },
        "permissions": permissions
    })


@router.post("/logout")
async def logout():
    return SuccessResponse.create(data=None)


@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest):
    return SuccessResponse.create(data={
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "new_refresh_token"
    })


@router.get("/me")
async def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="未授权")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = decode_token(token)
        username = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="无效的token")
    
    service = UserService(db)
    user = service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return SuccessResponse.create(data={
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "status": user.status
    })


@router.post("/password/change")
async def change_password(
    username: str = "admin",
    request: PasswordChange = None,
    db: Session = Depends(get_db)
):
    service = UserService(db)
    user = service.get_user_by_username(username)
    
    if not user or not verify_password(request.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="原密码错误")
    
    user.password_hash = get_password_hash(request.new_password)
    db.commit()
    
    return SuccessResponse.create(data=None)
