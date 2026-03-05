from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
import logging

from database import get_db
from app.core.response import SuccessResponse
from app.models import Node
from app.core.exceptions import NotFoundError

logger = logging.getLogger("agent")

router = APIRouter(prefix="/agent", tags=["Agent"])


class AgentRegisterRequest(BaseModel):
    node_name: str
    ip: str
    environment: str
    tags: Optional[List[str]] = None


class AgentHeartbeatRequest(BaseModel):
    node_id: int
    node_token: str
    cpu_usage: Optional[str] = None
    memory_usage: Optional[str] = None
    disk_usage: Optional[str] = None


class AgentTasksRequest(BaseModel):
    node_id: int
    node_token: str


class AgentTaskResultRequest(BaseModel):
    node_id: int
    node_token: str
    status: str
    exit_code: Optional[int] = None
    log_content: Optional[str] = None
    error_message: Optional[str] = None
    duration: Optional[int] = None


@router.post("/register")
async def agent_register(request: AgentRegisterRequest, db: Session = Depends(get_db)):
    import secrets
    
    try:
        logger.info(f"Register request: {request}")
        
        node = Node(
            name=request.node_name,
            ip=request.ip,
            environment=request.environment,
            tags=",".join(request.tags) if request.tags else "",
            status="online"
        )
        db.add(node)
        db.commit()
        db.refresh(node)
        
        node_token = secrets.token_hex(16)
        
        logger.info(f"Node registered successfully: id={node.id}")
        
        return SuccessResponse.create(data={
            "node_id": node.id,
            "node_token": node_token
        })
    except Exception as e:
        logger.error(f"Register error: {e}", exc_info=True)
        raise


@router.post("/heartbeat")
async def agent_heartbeat(request: AgentHeartbeatRequest, db: Session = Depends(get_db)):
    from datetime import datetime
    
    node = db.query(Node).filter(Node.id == request.node_id).first()
    if not node:
        return SuccessResponse.create(data={"message": "Node not found"})
    
    node.status = "online"
    node.last_heartbeat = datetime.now()
    node.cpu_usage = request.cpu_usage
    node.memory_usage = request.memory_usage
    node.disk_usage = request.disk_usage
    
    db.commit()
    
    return SuccessResponse.create(data=None)


@router.get("/tasks")
async def agent_get_tasks(
    node_id: int,
    node_token: str,
    db: Session = Depends(get_db)
):
    from app.models import NodeExecution, Execution
    
    node_executions = db.query(NodeExecution).join(
        Execution, NodeExecution.execution_id == Execution.execution_id
    ).filter(
        NodeExecution.node_id == node_id,
        NodeExecution.status == "pending"
    ).all()
    
    tasks = []
    for ne in node_executions:
        execution = db.query(Execution).filter(Execution.execution_id == ne.execution_id).first()
        if execution:
            from app.models import Script
            script = db.query(Script).filter(Script.id == execution.script_id).first()
            tasks.append({
                "execution_id": ne.execution_id,
                "script_id": execution.script_id,
                "script_name": execution.script_name,
                "script_content": script.content if script else "",
                "environment": execution.environment,
                "parameters": {}
            })
            
            ne.status = "running"
            db.commit()
    
    return SuccessResponse.create(data=tasks)


@router.post("/tasks/{execution_id}/result")
async def agent_report_result(
    execution_id: str,
    request: AgentTaskResultRequest,
    db: Session = Depends(get_db)
):
    from datetime import datetime
    from app.models import Execution, NodeExecution
    
    node_exec = db.query(NodeExecution).filter(
        NodeExecution.execution_id == execution_id,
        NodeExecution.node_id == request.node_id
    ).first()
    
    if node_exec:
        node_exec.status = request.status
        node_exec.exit_code = request.exit_code
        node_exec.log_content = request.log_content
        node_exec.error_message = request.error_message
        node_exec.duration = request.duration
        node_exec.completed_at = datetime.now()
    
    execution = db.query(Execution).filter(Execution.execution_id == execution_id).first()
    if execution:
        node_execs = db.query(NodeExecution).filter(
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
    
    db.commit()
    
    return SuccessResponse.create(data=None)
