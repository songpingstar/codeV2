from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from app.core.response import SuccessResponse
from database import get_db
from app.services.execution_service import ExecutionService
from app.core.dependencies import require_permission
from typing import Optional

router = APIRouter(prefix="/executions", tags=["Execution"])


@router.get("")
async def get_executions(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    environment: Optional[str] = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("execution:view"))
):
    service = ExecutionService(db)
    result = service.get_executions(page, size, keyword, status, environment)
    return SuccessResponse.create(data=result)


@router.get("/search")
async def search_executions(
    keyword: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("execution:view"))
):
    service = ExecutionService(db)
    result = service.search_executions(keyword, page, size)
    return SuccessResponse.create(data=result)


@router.get("/stats")
async def get_execution_stats(
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("execution:view"))
):
    service = ExecutionService(db)
    result = service.get_execution_stats()
    return SuccessResponse.create(data=result)


@router.get("/{execution_id}")
async def get_execution_detail(
    execution_id: str = Path(..., min_length=1),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("execution:view"))
):
    service = ExecutionService(db)
    result = service.get_execution_detail(execution_id)
    return SuccessResponse.create(data=result)


@router.get("/{execution_id}/logs")
async def get_execution_logs(
    execution_id: str = Path(..., min_length=1),
    node_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("execution:log:view"))
):
    service = ExecutionService(db)
    result = service.get_execution_logs(execution_id, node_id)
    return SuccessResponse.create(data=result)


@router.get("/{execution_id}/logs/download")
async def download_execution_logs(
    execution_id: str = Path(..., min_length=1),
    node_id: Optional[int] = Query(None),
    format: str = Query("txt"),
    user: dict = Depends(require_permission("execution:log:view"))
):
    return SuccessResponse.create(data={
        "download_url": f"/api/v1/executions/{execution_id}/logs/download?format={format}"
    })
