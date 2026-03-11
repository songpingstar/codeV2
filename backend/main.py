from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.exceptions import BaseError
from app.models import *
from app.routers import (
    dashboard,
    scripts,
    tasks,
    executions,
    nodes,
    users,
    script_categories,
    system_configs,
    auth,
    agent
)
from app.routers import ws_agent
from app.services.task_service import scheduler
from config import settings
from database import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix=settings.api_prefix)
app.include_router(scripts.router, prefix=settings.api_prefix)
app.include_router(tasks.router, prefix=settings.api_prefix)
app.include_router(executions.router, prefix=settings.api_prefix)
app.include_router(nodes.router, prefix=settings.api_prefix)
app.include_router(users.router, prefix=settings.api_prefix)
app.include_router(script_categories.router, prefix=settings.api_prefix)
app.include_router(system_configs.router, prefix=settings.api_prefix)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(agent.router, prefix=settings.api_prefix)
app.include_router(ws_agent.router, prefix=settings.api_prefix)


@app.on_event("startup")
async def startup_event():
    logger.info("正在初始化数据库...")
    init_db()
    logger.info("数据库初始化完成")
    
    logger.info("正在启动任务调度器...")
    scheduler.start()
    scheduler.reload_all_jobs()
    logger.info("任务调度器启动完成")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("正在关闭任务调度器...")
    scheduler.shutdown()
    logger.info("任务调度器已关闭")


@app.exception_handler(BaseError)
async def base_error_handler(request, exc: BaseError):
    return JSONResponse(
        status_code=exc.code,
        content={
            "code": exc.code,
            "message": exc.message,
            "data": exc.data
        }
    )


@app.get("/")
async def root():
    return {
        "code": 200,
        "message": "success",
        "data": {
            "app_name": settings.app_name,
            "version": settings.app_version
        }
    }


@app.get("/health")
async def health():
    return {
        "code": 200,
        "message": "success",
        "data": {"status": "healthy"}
    }
