from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict
import json
import logging

from database import get_db
from app.models import Node
from app.services.agent_service import AgentWebSocketService

logger = logging.getLogger("ws_agent")

router = APIRouter(tags=["WebSocket Agent"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
    
    async def connect(self, node_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[node_id] = websocket
        logger.info(f"Node {node_id} connected, total: {len(self.active_connections)}")
    
    def disconnect(self, node_id: int):
        if node_id in self.active_connections:
            del self.active_connections[node_id]
            logger.info(f"Node {node_id} disconnected, total: {len(self.active_connections)}")
            from app.core.datetime_utils import now_beijing
            from database import get_db
            db = next(get_db())
            node = db.query(Node).filter(Node.id == node_id).first()
            if node:
                node.status = "offline"
                node.last_heartbeat = now_beijing()
                db.commit()
                logger.info(f"Node {node_id} status updated to offline")
    
    async def send_message(self, node_id: int, message: dict) -> bool:
        if node_id in self.active_connections:
            try:
                await self.active_connections[node_id].send_json(message)
                return True
            except Exception as e:
                logger.error(f"Send to node {node_id} failed: {e}")
                self.disconnect(node_id)
                return False
        return False
    
    async def broadcast(self, message: dict):
        for node_id in list(self.active_connections.keys()):
            await self.send_message(node_id, message)
    
    def is_connected(self, node_id: int) -> bool:
        return node_id in self.active_connections


manager = ConnectionManager()


@router.websocket("/ws/agent")
async def websocket_endpoint(
    websocket: WebSocket,
    node_id: int = Query(...),
    node_token: str = Query(...)
):
    db = next(get_db())
    
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        logger.warning(f"WebSocket auth failed: node not found, node_id={node_id}")
        await websocket.close(code=4001, reason="Node not found")
        return
    
    if node.node_token != node_token:
        logger.warning(f"WebSocket auth failed: token mismatch")
        await websocket.close(code=4001, reason="Invalid node_id or node_token")
        return
    
    service = AgentWebSocketService(db)
    await manager.connect(node_id, websocket)
    
    try:
        await websocket.send_json({
            "type": "connected",
            "message": "Agent connected successfully"
        })
        
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                
                if msg_type == "ping":
                    await websocket.send_json({"type": "pong"})
                elif msg_type == "heartbeat":
                    logger.info(f"Received heartbeat from node {node_id}: {message}")
                    service.update_node_heartbeat(node_id)
                elif msg_type == "task_result":
                    execution_id = message.get("execution_id")
                    status = message.get("status")
                    exit_code = message.get("exit_code")
                    log_content = message.get("log_content")
                    error_message = message.get("error_message")
                    duration = message.get("duration")
                    
                    service.update_task_result(
                        execution_id=execution_id,
                        node_id=node_id,
                        status=status,
                        exit_code=exit_code,
                        log_content=log_content,
                        error_message=error_message,
                        duration=duration
                    )
                    
                    await websocket.send_json({
                        "type": "result_ack",
                        "execution_id": execution_id
                    })
                    
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON from node {node_id}")
                
    except WebSocketDisconnect:
        logger.info(f"Node {node_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        manager.disconnect(node_id)


async def push_task_to_node(node_id: int, task_data: dict) -> bool:
    return await manager.send_message(node_id, {
        "type": "task",
        "data": task_data
    })
