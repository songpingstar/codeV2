from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import ScriptCategory
from app.core.exceptions import NotFoundError


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_categories(self) -> List[dict]:
        categories = self.db.query(ScriptCategory).order_by(ScriptCategory.sort_order).all()
        result = []
        for cat in categories:
            result.append({
                "id": cat.id,
                "name": cat.name,
                "description": cat.description,
                "color": cat.color,
                "sort_order": cat.sort_order,
                "script_count": len(cat.scripts) if cat.scripts else 0,
                "created_at": cat.created_at.isoformat() if cat.created_at else None,
                "updated_at": cat.updated_at.isoformat() if cat.updated_at else None
            })
        return result
    
    def get_category_by_id(self, category_id: int) -> dict:
        category = self.db.query(ScriptCategory).filter(ScriptCategory.id == category_id).first()
        if not category:
            raise NotFoundError(f"分类不存在: {category_id}")
        
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "color": category.color,
            "sort_order": category.sort_order,
            "script_count": len(category.scripts) if category.scripts else 0,
            "created_at": category.created_at.isoformat() if category.created_at else None,
            "updated_at": category.updated_at.isoformat() if category.updated_at else None
        }
    
    def create_category(self, category_data: dict) -> dict:
        category = ScriptCategory(**category_data)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "color": category.color,
            "sort_order": category.sort_order,
            "created_at": category.created_at.isoformat() if category.created_at else None
        }
    
    def update_category(self, category_id: int, category_data: dict) -> dict:
        category = self.db.query(ScriptCategory).filter(ScriptCategory.id == category_id).first()
        if not category:
            raise NotFoundError(f"分类不存在: {category_id}")
        
        for key, value in category_data.items():
            if value is not None:
                setattr(category, key, value)
        
        self.db.commit()
        self.db.refresh(category)
        
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "color": category.color,
            "sort_order": category.sort_order,
            "updated_at": category.updated_at.isoformat() if category.updated_at else None
        }
    
    def delete_category(self, category_id: int):
        category = self.db.query(ScriptCategory).filter(ScriptCategory.id == category_id).first()
        if not category:
            raise NotFoundError(f"分类不存在: {category_id}")
        
        self.db.delete(category)
        self.db.commit()
