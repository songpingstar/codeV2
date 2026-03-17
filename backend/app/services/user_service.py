from sqlalchemy.orm import Session
from typing import Optional
from app.models import User
from app.core.exceptions import NotFoundError, BusinessError
import bcrypt


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
            password = user_data.pop("password")
            password_bytes = password.encode('utf-8')
            user_data["password_hash"] = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
        
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
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()
    
    def update_user(self, user_id: int, user_data: dict) -> dict:
        user = self.get_user_by_id(user_id)
        if not user:
            raise NotFoundError(f"用户不存在: {user_id}")
        
        if "password" in user_data:
            password = user_data.pop("password")
            password_bytes = password.encode('utf-8')
            user.password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
        
        for key, value in user_data.items():
            if hasattr(user, key):
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
        user = self.get_user_by_id(user_id)
        if not user:
            raise NotFoundError(f"用户不存在: {user_id}")
        
        self.db.delete(user)
        self.db.commit()
    
    def reset_password(self, user_id: int, new_password: str) -> None:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError(f"用户不存在: {user_id}")
        
        password_bytes = new_password.encode('utf-8')
        user.password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')
        self.db.commit()

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
        return bcrypt.checkpw(password_bytes, hash_bytes)
