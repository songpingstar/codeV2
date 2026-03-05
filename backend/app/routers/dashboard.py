from fastapi import APIRouter, Depends, Query
from app.core.response import SuccessResponse
from typing import List, Dict, Any

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats():
    return SuccessResponse.create(data={
        "today_executions": 10,
        "success_rate": 90.5,
        "online_nodes": 5,
        "total_nodes": 8
    })


@router.get("/script-distribution")
async def get_script_distribution():
    return SuccessResponse.create(data={
        "python": 15,
        "shell": 8
    })


@router.get("/task-stats")
async def get_task_stats():
    return SuccessResponse.create(data={
        "scheduled": 12,
        "triggered": 5,
        "manual": 3
    })


@router.get("/recent-executions")
async def get_recent_executions(
    limit: int = Query(5, ge=1, le=50)
):
    return SuccessResponse.create(data=[
        {
            "id": "exec-001",
            "script_name": "backup.sh",
            "status": "success",
            "node": "node-1",
            "start_time": "2026-02-28 10:00:00",
            "duration": "120s"
        }
    ])
