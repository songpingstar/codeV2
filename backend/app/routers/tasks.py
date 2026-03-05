from fastapi import APIRouter, Depends, Query, Path
from pydantic import BaseModel
from typing import List, Optional
from app.core.response import SuccessResponse

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


@router.get("")
async def get_tasks(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    environment: Optional[str] = None,
):
    return SuccessResponse.create(data={
        "total": 12,
        "items": []
    })


@router.get("/search")
async def search_tasks(
    keyword: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    return SuccessResponse.create(data={"total": 3, "items": []})


@router.get("/stats")
async def get_task_stats():
    return SuccessResponse.create(data={
        "total": 12,
        "enabled": 10,
        "disabled": 2
    })


@router.post("")
async def create_task(
    task: TaskCreate,
):
    return SuccessResponse.create(data={
        "id": 1,
        "name": task.name,
        "script_id": task.script_id,
        "cron_expression": task.cron_expression,
        "enabled": True,
        "next_run_time": "2026-02-28 10:00:00",
        "created_at": "2026-02-28 10:00:00"
    })


@router.put("/{id}")
async def update_task(
    id: int = Path(..., ge=1),
    task: TaskUpdate = None,
):
    return SuccessResponse.create(data={
        "id": id,
        "name": task.name,
        "script_id": task.script_id,
        "cron_expression": task.cron_expression,
        "enabled": True,
        "next_run_time": "2026-02-28 10:00:00",
        "updated_at": "2026-02-28 10:00:00"
    })


@router.delete("/{id}")
async def delete_task(
    id: int = Path(..., ge=1),
):
    return SuccessResponse.create(data=None)


@router.put("/{id}/toggle")
async def toggle_task(
    id: int = Path(..., ge=1),
    request: TaskToggleRequest = None,
):
    return SuccessResponse.create(data={
        "id": id,
        "enabled": request.enabled,
        "next_run_time": "2026-02-28 10:00:00"
    })


@router.post("/parse-cron")
async def parse_cron(
    cron_expression: str = Query(..., min_length=1),
):
    return SuccessResponse.create(data={
        "description": "每天10点执行",
        "next_runs": ["2026-02-28 10:00:00", "2026-03-01 10:00:00"]
    })


@router.get("/available-nodes")
async def get_available_nodes(
    environment: str = Query(...),
):
    return SuccessResponse.create(data=[
        {
            "id": 1,
            "name": "node-1",
            "ip": "192.168.1.1",
            "status": "online"
        }
    ])
