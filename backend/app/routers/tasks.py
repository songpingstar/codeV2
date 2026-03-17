from fastapi import APIRouter, Depends, Query, Path
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.response import SuccessResponse
from app.services.task_service import TaskService
from app.services.task_service import scheduler
from app.core.dependencies import require_permission
from database import get_db

router = APIRouter(prefix="/scheduled-tasks", tags=["Task"])


class TaskCreate(BaseModel):
    name: str
    script_id: int
    cron_expression: str
    cron_description: Optional[str] = None
    environment: str
    execution_mode: str = "all"
    target_nodes: Optional[List[int]] = None


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    script_id: Optional[int] = None
    cron_expression: Optional[str] = None
    cron_description: Optional[str] = None
    environment: Optional[str] = None
    execution_mode: Optional[str] = None
    target_nodes: Optional[List[int]] = None


class TaskToggleRequest(BaseModel):
    enabled: bool


class CronParseRequest(BaseModel):
    cron_expression: str


@router.get("")
async def get_tasks(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    environment: Optional[str] = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:view"))
):
    service = TaskService(db)
    result = service.get_tasks(page, size, keyword, status, environment)
    return SuccessResponse.create(data=result)


@router.get("/search")
async def search_tasks(
    keyword: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:view"))
):
    service = TaskService(db)
    result = service.search_tasks(keyword, page, size)
    return SuccessResponse.create(data=result)


@router.get("/stats")
async def get_task_stats(
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:view"))
):
    service = TaskService(db)
    result = service.get_task_stats()
    return SuccessResponse.create(data=result)


@router.post("")
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:create"))
):
    service = TaskService(db)
    result = service.create_task(task.model_dump())
    scheduler.reload_all_jobs()
    return SuccessResponse.create(data=result)


@router.put("/{id}")
async def update_task(
    id: int = Path(..., ge=1),
    task: TaskUpdate = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:update"))
):
    service = TaskService(db)
    result = service.update_task(id, task.model_dump(exclude_unset=True))
    return SuccessResponse.create(data=result)


@router.delete("/{id}")
async def delete_task(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:delete"))
):
    service = TaskService(db)
    service.delete_task(id)
    scheduler.reload_all_jobs()
    return SuccessResponse.create(data=None)


@router.put("/{id}/toggle")
async def toggle_task(
    id: int = Path(..., ge=1),
    request: TaskToggleRequest = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:toggle"))
):
    service = TaskService(db)
    result = service.toggle_task(id, request.enabled if request else True)
    scheduler.reload_all_jobs()
    return SuccessResponse.create(data=result)


@router.post("/parse-cron")
async def parse_cron(
    request: CronParseRequest = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:view"))
):
    service = TaskService(db)
    cron_expr = request.cron_expression if request else ""
    result = service.parse_cron(cron_expr)
    return SuccessResponse.create(data=result)


@router.get("/available-nodes")
async def get_available_nodes(
    environment: str = Query(...),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("task:view"))
):
    service = TaskService(db)
    result = service.get_available_nodes(environment)
    return SuccessResponse.create(data=result)
