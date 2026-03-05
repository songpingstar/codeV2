from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Script, ScriptCategory, Execution
from app.core.exceptions import NotFoundError, BusinessError


class ScriptService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_scripts(
        self,
        page: int = 1,
        size: int = 20,
        keyword: Optional[str] = None,
        type: Optional[str] = None,
        category_id: Optional[int] = None
    ) -> dict:
        query = self.db.query(Script)
        
        if keyword:
            query = query.filter(Script.name.like(f"%{keyword}%"))
        if type:
            query = query.filter(Script.type == type)
        if category_id:
            query = query.filter(Script.category_id == category_id)
        
        total = query.count()
        items = query.offset((page - 1) * size).limit(size).all()
        
        return {
            "total": total,
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "type": item.type,
                    "category_id": item.category_id,
                    "category": item.category.name if item.category else None,
                    "maintainer": item.maintainer,
                    "updateTime": item.updated_at.isoformat() if item.updated_at else None
                }
                for item in items
            ]
        }
    
    def get_script_by_id(self, script_id: int) -> dict:
        script = self.db.query(Script).filter(Script.id == script_id).first()
        if not script:
            raise NotFoundError(f"脚本不存在: {script_id}")
        
        return {
            "id": script.id,
            "name": script.name,
            "type": script.type,
            "category_id": script.category_id,
            "category": script.category.name if script.category else None,
            "content": script.content,
            "description": script.description,
            "maintainer": script.maintainer,
            "created_by": script.creator.username if script.creator else None,
            "created_at": script.created_at.isoformat() if script.created_at else None,
            "updateTime": script.updated_at.isoformat() if script.updated_at else None
        }
    
    def create_script(self, script_data: dict) -> dict:
        script = Script(**script_data)
        self.db.add(script)
        self.db.commit()
        self.db.refresh(script)
        
        return {
            "id": script.id,
            "name": script.name,
            "type": script.type,
            "category_id": script.category_id,
            "content": script.content,
            "created_at": script.created_at.isoformat() if script.created_at else None
        }
    
    def update_script(self, script_id: int, script_data: dict) -> dict:
        from datetime import datetime
        script = self.db.query(Script).filter(Script.id == script_id).first()
        if not script:
            raise NotFoundError(f"脚本不存在: {script_id}")
        
        for key, value in script_data.items():
            if value is not None:
                setattr(script, key, value)
        
        script.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(script)
        
        return {
            "id": script.id,
            "name": script.name,
            "type": script.type,
            "category_id": script.category_id,
            "content": script.content,
            "updateTime": script.updated_at.isoformat() if script.updated_at else None
        }
    
    def delete_script(self, script_id: int) -> None:
        script = self.db.query(Script).filter(Script.id == script_id).first()
        if not script:
            raise NotFoundError(f"脚本不存在: {script_id}")
        
        self.db.delete(script)
        self.db.commit()
    
    def execute_script(
        self,
        script_id: int,
        node_ids: List[int],
        environment: str,
        parameters: Optional[dict] = None,
        executor: str = "system"
    ) -> dict:
        from datetime import datetime
        import random
        import string
        
        script = self.db.query(Script).filter(Script.id == script_id).first()
        if not script:
            raise NotFoundError(f"脚本不存在: {script_id}")
        
        execution_id = f"exec-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.digits, k=6))}"
        
        execution = Execution(
            execution_id=execution_id,
            script_id=script.id,
            script_name=script.name,
            executor=executor,
            execution_type="manual",
            environment=environment,
            status="pending",
            node_count=len(node_ids),
            started_at=datetime.now()
        )
        self.db.add(execution)
        
        from app.models import Node
        from app.models import NodeExecution
        
        for node_id in node_ids:
            node = self.db.query(Node).filter(Node.id == node_id).first()
            if node:
                node_execution = NodeExecution(
                    execution_id=execution_id,
                    node_id=node.id,
                    node_name=node.name,
                    status="pending",
                    started_at=datetime.now()
                )
                self.db.add(node_execution)
        
        self.db.commit()
        self.db.refresh(execution)
        
        return {
            "execution_id": execution.execution_id,
            "status": execution.status,
            "started_at": execution.started_at.isoformat() if execution.started_at else None
        }