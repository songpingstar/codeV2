from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Execution, NodeExecution
from app.core.exceptions import NotFoundError


class ExecutionService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_executions(
        self,
        page: int = 1,
        size: int = 20,
        keyword: Optional[str] = None,
        status: Optional[str] = None,
        environment: Optional[str] = None
    ) -> dict:
        query = self.db.query(Execution)
        
        if keyword:
            query = query.filter(Execution.script_name.like(f"%{keyword}%"))
        if status:
            query = query.filter(Execution.status == status)
        if environment:
            query = query.filter(Execution.environment == environment)
        
        total = query.count()
        items = query.order_by(Execution.created_at.desc()).offset((page - 1) * size).limit(size).all()
        
        return {
            "total": total,
            "items": [
                {
                    "id": item.id,
                    "execution_id": item.execution_id,
                    "script_id": item.script_id,
                    "script_name": item.script_name,
                    "executor": item.executor,
                    "execution_type": item.execution_type,
                    "environment": item.environment,
                    "status": item.status,
                    "node_count": item.node_count,
                    "success_count": item.success_count,
                    "failed_count": item.failed_count,
                    "duration": item.duration,
                    "started_at": item.started_at.isoformat() if item.started_at else None,
                    "completed_at": item.completed_at.isoformat() if item.completed_at else None
                }
                for item in items
            ]
        }
    
    def search_executions(
        self,
        keyword: str,
        page: int = 1,
        size: int = 20
    ) -> dict:
        query = self.db.query(Execution).filter(
            Execution.script_name.like(f"%{keyword}%")
        )
        
        total = query.count()
        items = query.order_by(Execution.created_at.desc()).offset((page - 1) * size).limit(size).all()
        
        return {
            "total": total,
            "items": [
                {
                    "execution_id": item.execution_id,
                    "script_name": item.script_name,
                    "status": item.status,
                    "executor": item.executor,
                    "started_at": item.started_at.isoformat() if item.started_at else None
                }
                for item in items
            ]
        }
    
    def get_execution_stats(self) -> dict:
        total = self.db.query(Execution).count()
        success = self.db.query(Execution).filter(Execution.status == "success").count()
        failed = self.db.query(Execution).filter(Execution.status == "failed").count()
        
        return {
            "total": total,
            "success": success,
            "failed": failed,
            "success_rate": round(success / total * 100, 1) if total > 0 else 0
        }
    
    def get_execution_detail(self, execution_id: str) -> dict:
        execution = self.db.query(Execution).filter(Execution.execution_id == execution_id).first()
        if not execution:
            raise NotFoundError(f"执行记录不存在: {execution_id}")
        
        node_executions = self.db.query(NodeExecution).filter(
            NodeExecution.execution_id == execution_id
        ).all()
        
        return {
            "id": execution.id,
            "execution_id": execution.execution_id,
            "script_id": execution.script_id,
            "script_name": execution.script_name,
            "task_id": execution.task_id,
            "executor": execution.executor,
            "execution_type": execution.execution_type,
            "environment": execution.environment,
            "status": execution.status,
            "node_count": execution.node_count,
            "success_count": execution.success_count,
            "failed_count": execution.failed_count,
            "duration": execution.duration,
            "error_message": execution.error_message,
            "started_at": execution.started_at.isoformat() if execution.started_at else None,
            "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
            "node_executions": [
                {
                    "id": ne.id,
                    "node_id": ne.node_id,
                    "node_name": ne.node_name,
                    "status": ne.status,
                    "exit_code": ne.exit_code,
                    "duration": ne.duration,
                    "started_at": ne.started_at.isoformat() if ne.started_at else None,
                    "completed_at": ne.completed_at.isoformat() if ne.completed_at else None
                }
                for ne in node_executions
            ]
        }
    
    def get_execution_logs(self, execution_id: str, node_id: Optional[int] = None) -> dict:
        query = self.db.query(NodeExecution).filter(NodeExecution.execution_id == execution_id)
        
        if node_id:
            query = query.filter(NodeExecution.node_id == node_id)
        
        node_execution = query.first()
        if not node_execution:
            raise NotFoundError(f"执行记录不存在: {execution_id}")
        
        return {
            "execution_id": node_execution.execution_id,
            "node_id": node_execution.node_id,
            "node_name": node_execution.node_name,
            "status": node_execution.status,
            "log_content": node_execution.log_content,
            "exit_code": node_execution.exit_code,
            "duration": node_execution.duration,
            "error_message": node_execution.error_message,
            "started_at": node_execution.started_at.isoformat() if node_execution.started_at else None,
            "completed_at": node_execution.completed_at.isoformat() if node_execution.completed_at else None
        }
    
    def update_execution_status(
        self,
        execution_id: str,
        status: str,
        exit_code: Optional[int] = None,
        log_content: Optional[str] = None,
        error_message: Optional[str] = None,
        duration: Optional[int] = None,
        node_id: Optional[int] = None
    ) -> dict:
        from datetime import datetime
        
        if node_id:
            node_execution = self.db.query(NodeExecution).filter(
                NodeExecution.execution_id == execution_id,
                NodeExecution.node_id == node_id
            ).first()
            
            if node_execution:
                node_execution.status = status
                node_execution.exit_code = exit_code
                node_execution.log_content = log_content
                node_execution.error_message = error_message
                node_execution.duration = duration
                node_execution.completed_at = datetime.now()
                
                self.db.commit()
        
        execution = self.db.query(Execution).filter(Execution.execution_id == execution_id).first()
        if execution:
            node_execs = self.db.query(NodeExecution).filter(
                NodeExecution.execution_id == execution_id
            ).all()
            
            success_count = sum(1 for ne in node_execs if ne.status == "success")
            failed_count = sum(1 for ne in node_execs if ne.status == "failed")
            
            execution.success_count = success_count
            execution.failed_count = failed_count
            
            if failed_count > 0:
                execution.status = "failed"
            elif success_count == execution.node_count:
                execution.status = "success"
            elif any(ne.status == "running" for ne in node_execs):
                execution.status = "running"
            
            execution.completed_at = datetime.now()
            
            if duration:
                execution.duration = duration
            
            self.db.commit()
        
        return {"status": "updated"}
