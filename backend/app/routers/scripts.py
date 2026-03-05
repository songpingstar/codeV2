from fastapi import APIRouter, Depends, Query, Path
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.response import SuccessResponse
from app.services.script_service import ScriptService
from database import get_db

router = APIRouter(prefix="/scripts", tags=["Script"])


class ScriptCreate(BaseModel):
    name: str
    type: str
    category_id: int
    content: str
    description: Optional[str] = None
    maintainer: str


class ScriptUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    category_id: Optional[int] = None
    content: Optional[str] = None
    description: Optional[str] = None
    maintainer: Optional[str] = None


class ScriptExecuteRequest(BaseModel):
    node_ids: List[int]
    environment: str
    parameters: Optional[dict] = None


@router.get("")
async def get_scripts(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    keyword: Optional[str] = None,
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    service = ScriptService(db)
    result = service.get_scripts(page, size, keyword, type, category_id)
    return SuccessResponse.create(data=result)


@router.get("/search")
async def search_scripts(
    keyword: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    return SuccessResponse.create(data={
        "total": 5,
        "items": []
    })


@router.post("")
async def create_script(
    script: ScriptCreate,
    db: Session = Depends(get_db)
):
    service = ScriptService(db)
    result = service.create_script(script.model_dump())
    return SuccessResponse.create(data=result)


@router.put("/{id}")
async def update_script(
    id: int = Path(..., ge=1),
    script: ScriptUpdate = None,
    db: Session = Depends(get_db)
):
    service = ScriptService(db)
    result = service.update_script(id, script.model_dump(exclude_unset=True))
    return SuccessResponse.create(data=result)


@router.delete("/{id}")
async def delete_script(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    service = ScriptService(db)
    service.delete_script(id)
    return SuccessResponse.create(data=None)


@router.get("/{id}")
async def get_script_detail(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    service = ScriptService(db)
    result = service.get_script_by_id(id)
    return SuccessResponse.create(data=result)


@router.post("/{id}/execute")
async def execute_script(
    id: int = Path(..., ge=1),
    request: ScriptExecuteRequest = None,
    db: Session = Depends(get_db)
):
    from app.routers.ws_agent import push_task_to_node
    from app.models import Script
    
    service = ScriptService(db)
    result = service.execute_script(
        script_id=id,
        node_ids=request.node_ids if request else [],
        environment=request.environment if request else "prod",
        parameters=request.parameters if request else None
    )
    
    script = db.query(Script).filter(Script.id == id).first()
    if script:
        for node_id in (request.node_ids if request else []):
            await push_task_to_node(node_id, {
                "execution_id": result["execution_id"],
                "script_id": script.id,
                "script_name": script.name,
                "script_content": script.content,
                "environment": request.environment if request else "prod",
                "parameters": request.parameters if request else {}
            })
    
    return SuccessResponse.create(data=result)
