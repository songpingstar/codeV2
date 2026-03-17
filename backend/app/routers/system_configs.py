from fastapi import APIRouter, Depends, Path, Query
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.response import SuccessResponse
from app.services.config_service import ConfigService
from app.core.dependencies import require_permission
from database import get_db

router = APIRouter(prefix="/system-configs", tags=["Config"])


class ConfigUpdate(BaseModel):
    config_value: str


class ConfigBatchUpdate(BaseModel):
    configs: List[dict]


@router.get("")
async def get_system_configs(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("config:view"))
):
    service = ConfigService(db)
    result = service.get_configs(category)
    return SuccessResponse.create(data=result)


@router.put("/{id}")
async def update_system_config(
    id: int = Path(..., ge=1),
    request: ConfigUpdate = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("config:update"))
):
    service = ConfigService(db)
    result = service.update_config(id, request.config_value)
    return SuccessResponse.create(data=result)


@router.put("/batch")
async def batch_update_system_configs(
    request: ConfigBatchUpdate = None,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("config:update"))
):
    service = ConfigService(db)
    result = service.batch_update_configs(request.configs)
    return SuccessResponse.create(data=result)
