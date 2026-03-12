from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.response import SuccessResponse
from app.services.dashboard_service import DashboardService
from database import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    service = DashboardService(db)
    data = service.get_stats()
    return SuccessResponse.create(data=data)


@router.get("/script-distribution")
async def get_script_distribution(db: Session = Depends(get_db)):
    service = DashboardService(db)
    data = service.get_script_distribution()
    return SuccessResponse.create(data=data)


@router.get("/task-stats")
async def get_task_stats(db: Session = Depends(get_db)):
    service = DashboardService(db)
    data = service.get_task_stats()
    return SuccessResponse.create(data=data)


@router.get("/recent-executions")
async def get_recent_executions(
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db)
):
    service = DashboardService(db)
    data = service.get_recent_executions(limit)
    return SuccessResponse.create(data=data)
