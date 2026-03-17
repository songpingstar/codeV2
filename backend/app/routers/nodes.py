from fastapi import APIRouter, Depends, Query, Path
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.response import SuccessResponse
from app.services.node_service import NodeService
from app.core.dependencies import require_permission
from database import get_db

router = APIRouter(prefix="/nodes", tags=["Node"])


class NodeCreate(BaseModel):
    name: str
    ip: str
    environment: str
    tags: Optional[List[str]] = None


class NodeUpdate(BaseModel):
    name: Optional[str] = None
    ip: Optional[str] = None
    environment: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None


@router.get("")
async def get_nodes(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    environment: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("node:view"))
):
    service = NodeService(db)
    result = service.get_nodes(page, size, keyword, environment, status)
    return SuccessResponse.create(data=result)


@router.get("/search")
async def search_nodes(
    keyword: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("node:view"))
):
    service = NodeService(db)
    result = service.get_nodes(page, size, keyword=keyword)
    return SuccessResponse.create(data=result)


@router.get("/stats")
async def get_node_stats(
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("node:view"))
):
    service = NodeService(db)
    result = service.get_node_stats()
    return SuccessResponse.create(data=result)


@router.post("")
async def create_node(
    node: NodeCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("node:create"))
):
    service = NodeService(db)
    result = service.create_node(node.model_dump())
    return SuccessResponse.create(data=result)


@router.put("/{id}")
async def update_node(
    id: int = Path(..., ge=1),
    node: NodeUpdate = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("node:update"))
):
    service = NodeService(db)
    result = service.update_node(id, node.model_dump(exclude_unset=True))
    return SuccessResponse.create(data=result)


@router.delete("/{id}")
async def delete_node(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("node:delete"))
):
    service = NodeService(db)
    service.delete_node(id)
    return SuccessResponse.create(data=None)


@router.get("/{id}")
async def get_node_detail(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("node:view"))
):
    service = NodeService(db)
    result = service.get_node_by_id(id)
    return SuccessResponse.create(data=result)


@router.get("/{id}/executions")
async def get_node_executions(
    id: int = Path(..., ge=1),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("node:view"))
):
    service = NodeService(db)
    result = service.get_node_executions(id, page, size, status)
    return SuccessResponse.create(data=result)
