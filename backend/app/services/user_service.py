from sqlalchemy.orm import Session
from typing import Optional
from app.models import User
from app.core.exceptions import NotFoundError, BusinessError
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_users(self, page: int = 1, size: int = 20, keyword: Optional[str] = None, role: Optional[str] = None, status: Optional[str] = None) -> dict:
        query = self.db.query(User)
        
        if keyword:
            query = query.filter(User.username.like(f"%{keyword}%"))
        if role:
            query = query.filter(User.role == role)
        if status:
            query = query.filter(User.status == status)
        
        total = query.count()
        items = query.offset((page - 1) * size).limit(size).all()
        
        return {
            "total": total,
            "items": [
                {
                    "id": item.id,
                    "username": item.username,
                    "email": item.email,
                    "role": item.role,
                    "status": item.status,
                    "created_at": item.created_at.isoformat() if item.created_at else None
                }
                for item in items
            ]
        }
    
    def create_user(self, user_data: dict) -> dict:
        if "password" in user_data:
            user_data["password_hash"] = pwd_context.hash(user_data.pop("password"))
        
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    
    def update_user(self, user_id: int, user_data: dict) -> dict:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError(f"用户不存在: {user_id}")
        
        for key, value in user_data.items():
            if value is not None:
                setattr(user, key, value)
        
        self.db.commit()
        self.db.refresh(user)
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None
        }
    
    def delete_user(self, user_id: int) -> None:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError(f"用户不存在: {user_id}")
        
        self.db.delete(user)
        self.db.commit()
    
    def reset_password(self, user_id: int, new_password: str) -> None:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError(f"用户不存在: {user_id}")
        
        user.password_hash = pwd_context.hash(new_password)
        self.db.commit()