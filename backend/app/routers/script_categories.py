from fastapi import APIRouter, Depends, Path
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.response import SuccessResponse
from app.services.category_service import CategoryService
from database import get_db

router = APIRouter(prefix="/script-categories", tags=["Category"])


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "blue"
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    sort_order: Optional[int] = None


@router.get("")
async def get_categories(db: Session = Depends(get_db)):
    service = CategoryService(db)
    result = service.get_categories()
    return SuccessResponse.create(data=result)


@router.post("")
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    service = CategoryService(db)
    result = service.create_category(category.model_dump())
    return SuccessResponse.create(data=result)


@router.put("/{id}")
async def update_category(
    id: int = Path(..., ge=1),
    category: CategoryUpdate = None,
    db: Session = Depends(get_db)
):
    service = CategoryService(db)
    result = service.update_category(id, category.model_dump(exclude_unset=True))
    return SuccessResponse.create(data=result)


@router.delete("/{id}")
async def delete_category(
    id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    service = CategoryService(db)
    service.delete_category(id)
    return SuccessResponse.create(data=None)
