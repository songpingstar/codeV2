from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import Optional
from datetime import datetime

from app.models import Execution, NodeExecution, Node


class AgentWebSocketService:
    def __init__(self, db: Session):
        self.db = db
    
    def update_node_heartbeat(self, node_id: int):
        node = self.db.query(Node).filter(Node.id == node_id).first()
        if node:
            node.last_heartbeat = func.current_timestamp()
            self.db.commit()
    
    def update_task_result(
        self,
        execution_id: str,
        node_id: int,
        status: str,
        exit_code: Optional[int],
        log_content: Optional[str],
        error_message: Optional[str],
        duration: Optional[int]
    ):
        node_exec = self.db.query(NodeExecution).filter(
            NodeExecution.execution_id == execution_id,
            NodeExecution.node_id == node_id
        ).first()
        
        if node_exec:
            node_exec.status = status
            node_exec.exit_code = exit_code
            node_exec.log_content = log_content
            node_exec.error_message = error_message
            node_exec.duration = duration
            node_exec.completed_at = datetime.now()
        
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
            
            if all(ne.status in ["success", "failed"] for ne in node_execs):
                execution.completed_at = datetime.now()
                if duration:
                    execution.duration = duration
        
        self.db.commit()
        
        return {"status": "updated"}
    
    def verify_node(self, node_id: int) -> Optional[Node]:
        return self.db.query(Node).filter(Node.id == node_id).first()
