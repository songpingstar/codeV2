from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Node
from app.core.exceptions import NotFoundError
from app.core.datetime_utils import to_iso_string


class NodeService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_nodes(
        self,
        page: int = 1,
        size: int = 20,
        keyword: Optional[str] = None,
        environment: Optional[str] = None,
        status: Optional[str] = None
    ) -> dict:
        query = self.db.query(Node)
        
        if keyword:
            query = query.filter(
                (Node.name.like(f"%{keyword}%")) | 
                (Node.ip.like(f"%{keyword}%"))
            )
        if environment:
            query = query.filter(Node.environment == environment)
        if status:
            query = query.filter(Node.status == status)
        
        total = query.count()
        items = query.offset((page - 1) * size).limit(size).all()
        
        return {
            "total": total,
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "ip": item.ip,
                    "environment": item.environment,
                    "tags": item.tags.split(",") if item.tags else [],
                    "status": item.status,
                    "last_heartbeat": to_iso_string(item.last_heartbeat)
                }
                for item in items
            ]
        }
    
    def get_node_by_id(self, node_id: int) -> dict:
        node = self.db.query(Node).filter(Node.id == node_id).first()
        if not node:
            raise NotFoundError(f"节点不存在: {node_id}")
        
        return {
            "id": node.id,
            "name": node.name,
            "ip": node.ip,
            "environment": node.environment,
            "tags": node.tags.split(",") if node.tags else [],
            "status": node.status,
            "last_heartbeat": to_iso_string(node.last_heartbeat),
            "created_at": to_iso_string(node.created_at),
            "updated_at": to_iso_string(node.updated_at)
        }
    
    def create_node(self, node_data: dict) -> dict:
        if "tags" in node_data and isinstance(node_data["tags"], list):
            node_data["tags"] = ",".join(node_data["tags"])
        
        node = Node(**node_data)
        self.db.add(node)
        self.db.commit()
        self.db.refresh(node)
        
        return {
            "id": node.id,
            "name": node.name,
            "ip": node.ip,
            "environment": node.environment,
            "tags": node.tags.split(",") if node.tags else [],
            "status": node.status,
            "created_at": to_iso_string(node.created_at)
        }
    
    def update_node(self, node_id: int, node_data: dict) -> dict:
        node = self.db.query(Node).filter(Node.id == node_id).first()
        if not node:
            raise NotFoundError(f"节点不存在: {node_id}")
        
        if "tags" in node_data and isinstance(node_data["tags"], list):
            node_data["tags"] = ",".join(node_data["tags"])
        
        for key, value in node_data.items():
            if value is not None:
                setattr(node, key, value)
        
        self.db.commit()
        self.db.refresh(node)
        
        return {
            "id": node.id,
            "name": node.name,
            "ip": node.ip,
            "environment": node.environment,
            "tags": node.tags.split(",") if node.tags else [],
            "updated_at": to_iso_string(node.updated_at)
        }
    
    def delete_node(self, node_id: int) -> None:
        node = self.db.query(Node).filter(Node.id == node_id).first()
        if not node:
            raise NotFoundError(f"节点不存在: {node_id}")
        
        self.db.delete(node)
        self.db.commit()
    
    def get_node_stats(self) -> dict:
        total = self.db.query(Node).count()
        online = self.db.query(Node).filter(Node.status == "online").count()
        offline = self.db.query(Node).filter(Node.status == "offline").count()
        online_rate = round(online / total * 100, 1) if total > 0 else 0
        
        return {
            "total": total,
            "online": online,
            "offline": offline,
            "online_rate": online_rate
        }
    
    def get_node_executions(
        self,
        node_id: int,
        page: int = 1,
        size: int = 20,
        status: Optional[str] = None
    ) -> dict:
        from app.models import NodeExecution
        
        query = self.db.query(NodeExecution).filter(NodeExecution.node_id == node_id)
        
        if status:
            query = query.filter(NodeExecution.status == status)
        
        total = query.count()
        items = query.order_by(NodeExecution.created_at.desc()).offset((page - 1) * size).limit(size).all()
        
        return {
            "total": total,
            "items": [
                {
                    "execution_id": item.execution_id,
                    "node_name": item.node_name,
                    "status": item.status,
                    "duration": item.duration,
                    "started_at": item.started_at.isoformat() if item.started_at else None
                }
                for item in items
            ]
        }