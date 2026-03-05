from fastapi import APIRouter
from pydantic import BaseModel
from app.core.response import SuccessResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/login")
async def login(request: LoginRequest):
    return SuccessResponse.create(data={
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "username": request.username,
            "email": "admin@example.com",
            "role": "admin"
        }
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
async def get_current_user():
    return SuccessResponse.create(data={
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "status": "active"
    })
