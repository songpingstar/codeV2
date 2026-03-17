from sqlalchemy.orm import Session
from typing import Optional, List
from app.models import SystemConfig
from app.core.exceptions import NotFoundError


class ConfigService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_configs(self, category: Optional[str] = None) -> List[dict]:
        query = self.db.query(SystemConfig)
        if category:
            query = query.filter(SystemConfig.category == category)
        
        configs = query.all()
        return [
            {
                "id": item.id,
                "config_key": item.config_key,
                "config_value": item.config_value,
                "config_type": item.config_type,
                "description": item.description,
                "category": item.category,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None
            }
            for item in configs
        ]
    
    def get_config_by_id(self, config_id: int) -> dict:
        config = self.db.query(SystemConfig).filter(SystemConfig.id == config_id).first()
        if not config:
            raise NotFoundError(f"配置不存在: {config_id}")
        
        return {
            "id": config.id,
            "config_key": config.config_key,
            "config_value": config.config_value,
            "config_type": config.config_type,
            "description": config.description,
            "category": config.category,
            "updated_at": config.updated_at.isoformat() if config.updated_at else None
        }
    
    def update_config(self, config_id: int, config_value: str) -> dict:
        config = self.db.query(SystemConfig).filter(SystemConfig.id == config_id).first()
        if not config:
            raise NotFoundError(f"配置不存在: {config_id}")
        
        config.config_value = config_value
        self.db.commit()
        self.db.refresh(config)
        
        return {
            "id": config.id,
            "config_key": config.config_key,
            "config_value": config.config_value,
            "config_type": config.config_type,
            "description": config.description,
            "category": config.category,
            "updated_at": config.updated_at.isoformat() if config.updated_at else None
        }
    
    def batch_update_configs(self, configs: List[dict]) -> dict:
        updated_count = 0
        for item in configs:
            config_id = item.get("id")
            config_value = item.get("config_value")
            if config_id and config_value is not None:
                config = self.db.query(SystemConfig).filter(SystemConfig.id == config_id).first()
                if config:
                    config.config_value = config_value
                    updated_count += 1
        
        self.db.commit()
        return {"updated_count": updated_count}
