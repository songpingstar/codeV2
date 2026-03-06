from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import Optional
from datetime import datetime, timedelta
import secrets
import logging
from app.models import Execution, NodeExecution, Node, RegistrationToken
from app.core.datetime_utils import now_beijing

logger = logging.getLogger("agent_service")


class AgentService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_token(self, expires_hours: int = 24) -> str:
        token = secrets.token_hex(16)
        expires_at = datetime.now() + timedelta(hours=expires_hours)
        
        reg_token = RegistrationToken(
            token=token,
            status="pending",
            expires_at=expires_at
        )
        self.db.add(reg_token)
        self.db.commit()
        self.db.refresh(reg_token)
        
        return token
    
    def get_current_token(self) -> Optional[str]:
        reg_token = self.db.query(RegistrationToken).filter(
            RegistrationToken.status == "pending"
        ).order_by(RegistrationToken.created_at.desc()).first()
        
        if reg_token and reg_token.expires_at < datetime.now():
            reg_token.status = "expired"
            self.db.commit()
            return None
        
        return reg_token.token if reg_token else None
    
    def validate_token(self, token: str) -> Optional[RegistrationToken]:
        reg_token = self.db.query(RegistrationToken).filter(
            RegistrationToken.token == token
        ).first()
        
        if not reg_token:
            return None
        
        if reg_token.status != "pending":
            return None
        
        if reg_token.expires_at < datetime.now():
            reg_token.status = "expired"
            self.db.commit()
            return None
        
        return reg_token
    
    def consume_token(self, token: str) -> bool:
        reg_token = self.validate_token(token)
        if not reg_token:
            return False
        
        reg_token.status = "used"
        reg_token.used_at = datetime.now()
        self.db.commit()
        return True


class AgentWebSocketService:
    def __init__(self, db: Session):
        self.db = db
    
    def verify_node_token(self, node_id: int, node_token: str) -> Optional[Node]:
        node = self.db.query(Node).filter(Node.id == node_id).first()
        if not node:
            return None
        if node.node_token != node_token:
            return None
        return node
    
    def update_node_heartbeat(self, node_id: int):
        node = self.db.query(Node).filter(Node.id == node_id).first()
        if node:
            node.last_heartbeat = now_beijing()
            node.status = "online"
            self.db.commit()
            logger.info(f"Node {node_id} status updated to online")
        else:
            logger.warning(f"Node {node_id} not found for heartbeat update")
    
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
