from fastapi import APIRouter, Depends, Path, Query
from pydantic import BaseModel
from typing import List, Optional
from app.core.response import SuccessResponse

router = APIRouter(prefix="/system-configs", tags=["Config"])


class ConfigUpdate(BaseModel):
    config_value: str


class ConfigBatchUpdate(BaseModel):
    configs: List[dict]


@router.get("")
async def get_system_configs(
    category: Optional[str] = Query(None),
):
    return SuccessResponse.create(data=[
        {
            "id": 1,
            "config_key": "system.name",
            "config_value": "运维任务调度系统",
            "config_type": "string",
            "description": "系统名称",
            "category": "system"
        }
    ])


@router.put("/{id}")
async def update_system_config(
    id: int = Path(..., ge=1),
    request: ConfigUpdate = None,
):
    return SuccessResponse.create(data={
        "id": id,
        "config_key": "system.name",
        "config_value": request.config_value,
        "updated_at": "2026-02-28 10:00:00"
    })


@router.put("/batch")
async def batch_update_system_configs(
    request: ConfigBatchUpdate = None,
):
    return SuccessResponse.create(data={
        "updated_count": len(request.configs)
    })
