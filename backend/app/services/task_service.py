from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json
import asyncio
import logging
import uuid

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.jobstores.memory import MemoryJobStore

from app.models import ScheduledTask, Script, Node, Execution, NodeExecution
from app.core.exceptions import NotFoundError, BusinessError
from database import SessionLocal


logger = logging.getLogger(__name__)


class TaskService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_tasks(
        self,
        page: int = 1,
        size: int = 20,
        keyword: Optional[str] = None,
        status: Optional[str] = None,
        environment: Optional[str] = None
    ) -> dict:
        query = self.db.query(ScheduledTask)
        
        if keyword:
            query = query.filter(ScheduledTask.name.like(f"%{keyword}%"))
        if status:
            if status == "enabled":
                query = query.filter(ScheduledTask.enabled == True)
            elif status == "disabled":
                query = query.filter(ScheduledTask.enabled == False)
        if environment:
            query = query.filter(ScheduledTask.environment == environment)
        
        total = query.count()
        items = query.offset((page - 1) * size).limit(size).all()
        
        return {
            "total": total,
            "items": self._format_task_list(items)
        }
    
    def search_tasks(
        self,
        keyword: str,
        page: int = 1,
        size: int = 20
    ) -> dict:
        query = self.db.query(ScheduledTask).filter(
            ScheduledTask.name.like(f"%{keyword}%")
        )
        
        total = query.count()
        items = query.offset((page - 1) * size).limit(size).all()
        
        return {
            "total": total,
            "items": self._format_task_list(items)
        }
    
    def get_task_stats(self) -> dict:
        total = self.db.query(ScheduledTask).count()
        enabled = self.db.query(ScheduledTask).filter(ScheduledTask.enabled == True).count()
        disabled = self.db.query(ScheduledTask).filter(ScheduledTask.enabled == False).count()
        
        return {
            "total": total,
            "enabled": enabled,
            "disabled": disabled
        }
    
    def get_task_by_id(self, task_id: int) -> dict:
        task = self.db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
        if not task:
            raise NotFoundError(f"任务不存在: {task_id}")
        
        return self._format_task_detail(task)
    
    def create_task(self, task_data: dict) -> dict:
        script_id = task_data.get("script_id")
        script = self.db.query(Script).filter(Script.id == script_id).first()
        if not script:
            raise NotFoundError(f"脚本不存在: {script_id}")
        
        if task_data.get("target_nodes"):
            task_data["target_nodes"] = json.dumps(task_data["target_nodes"])
        
        if not task_data.get("cron_description"):
            task_data["cron_description"] = self._describe_cron(task_data.get("cron_expression", ""))
        
        task = ScheduledTask(**task_data)
        task.enabled = True
        
        next_run = self._calculate_next_run_time(task.cron_expression)
        task.next_run_time = next_run
        
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        
        return {
            "id": task.id,
            "name": task.name,
            "script_id": task.script_id,
            "cron_expression": task.cron_expression,
            "environment": task.environment,
            "execution_mode": task.execution_mode,
            "enabled": task.enabled,
            "next_run_time": task.next_run_time.isoformat() if task.next_run_time else None,
            "created_at": task.created_at.isoformat() if task.created_at else None
        }
    
    def update_task(self, task_id: int, task_data: dict) -> dict:
        task = self.db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
        if not task:
            raise NotFoundError(f"任务不存在: {task_id}")
        
        if "script_id" in task_data:
            script = self.db.query(Script).filter(Script.id == task_data["script_id"]).first()
            if not script:
                raise NotFoundError(f"脚本不存在: {task_data['script_id']}")
        
        if "target_nodes" in task_data:
            task_data["target_nodes"] = json.dumps(task_data["target_nodes"]) if task_data["target_nodes"] else None
        
        for key, value in task_data.items():
            if value is not None:
                setattr(task, key, value)
        
        if "cron_expression" in task_data:
            next_run = self._calculate_next_run_time(task.cron_expression)
            task.next_run_time = next_run
        
        task.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(task)
        
        return {
            "id": task.id,
            "name": task.name,
            "script_id": task.script_id,
            "cron_expression": task.cron_expression,
            "enabled": task.enabled,
            "next_run_time": task.next_run_time.isoformat() if task.next_run_time else None,
            "updated_at": task.updated_at.isoformat() if task.updated_at else None
        }
    
    def delete_task(self, task_id: int) -> None:
        task = self.db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
        if not task:
            raise NotFoundError(f"任务不存在: {task_id}")
        
        self.db.delete(task)
        self.db.commit()
    
    def toggle_task(self, task_id: int, enabled: bool) -> dict:
        task = self.db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
        if not task:
            raise NotFoundError(f"任务不存在: {task_id}")
        
        task.enabled = enabled
        if enabled and task.cron_expression:
            task.next_run_time = self._calculate_next_run_time(task.cron_expression)
        elif not enabled:
            task.next_run_time = None
        
        task.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(task)
        
        return {
            "id": task.id,
            "enabled": task.enabled,
            "next_run_time": task.next_run_time.isoformat() if task.next_run_time else None
        }
    
    def get_available_nodes(self, environment: str) -> List[dict]:
        nodes = self.db.query(Node).filter(
            Node.environment == environment,
            Node.status == "online"
        ).all()
        
        return [
            {
                "id": node.id,
                "name": node.name,
                "ip": node.ip,
                "status": node.status,
                "environment": node.environment
            }
            for node in nodes
        ]
    
    def parse_cron(self, cron_expression: str) -> dict:
        description = self._describe_cron(cron_expression)
        next_runs = self._get_next_runs(cron_expression, 5)
        
        return {
            "description": description,
            "next_runs": next_runs
        }
    
    def _format_task_list(self, tasks: List[ScheduledTask]) -> List[dict]:
        now = datetime.now()
        result = []
        updated = False
        for task in tasks:
            next_run = task.next_run_time
            if not next_run or next_run < now:
                if task.enabled:
                    next_run = self._calculate_next_run_time(task.cron_expression)
                    if next_run:
                        task.next_run_time = next_run
                        self.db.add(task)
                        updated = True
            
            result.append({
                "id": task.id,
                "name": task.name,
                "script_id": task.script_id,
                "script_name": task.script.name if task.script else None,
                "cron_expression": task.cron_expression,
                "cron_description": task.cron_description,
                "environment": task.environment,
                "execution_mode": task.execution_mode,
                "target_nodes": json.loads(task.target_nodes) if task.target_nodes else [],
                "enabled": task.enabled,
                "next_run_time": next_run.isoformat() if next_run else None,
                "last_run_time": task.last_run_time.isoformat() if task.last_run_time else None,
                "last_run_status": task.last_run_status
            })
        
        if updated:
            self.db.commit()
        
        return result
    
    def _format_task_detail(self, task: ScheduledTask) -> dict:
        target_nodes = []
        if task.target_nodes:
            try:
                target_nodes = json.loads(task.target_nodes)
            except:
                target_nodes = []
        
        return {
            "id": task.id,
            "name": task.name,
            "script_id": task.script_id,
            "script_name": task.script.name if task.script else None,
            "cron_expression": task.cron_expression,
            "cron_description": task.cron_description,
            "environment": task.environment,
            "execution_mode": task.execution_mode,
            "target_nodes": target_nodes,
            "enabled": task.enabled,
            "next_run_time": task.next_run_time.isoformat() if task.next_run_time else None,
            "last_run_time": task.last_run_time.isoformat() if task.last_run_time else None,
            "last_run_status": task.last_run_status,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "updated_at": task.updated_at.isoformat() if task.updated_at else None
        }
    
    def _calculate_next_run_time(self, cron_expression: str) -> Optional[datetime]:
        try:
            from croniter import croniter
            base_time = datetime.now()
            cron = croniter(cron_expression, base_time)
            return cron.get_next(datetime)
        except Exception as e:
            import logging
            logging.warning(f"croniter failed: {e}, using fallback")
            return self._calculate_next_run_time_fallback(cron_expression)
    
    def _calculate_next_run_time_fallback(self, cron_expression: str) -> Optional[datetime]:
        try:
            parts = cron_expression.split()
            if len(parts) < 5:
                return None
            
            now = datetime.now()
            minute_str = parts[0]
            hour_str = parts[1]
            
            def get_next_value(field: str, max_val: int, current: int) -> int:
                if field == '*':
                    return current
                if '/' in field:
                    step = int(field.split('/')[1])
                    if max_val == 59:
                        return (current // step + 1) * step
                    else:
                        return (current // step + 1) * step
                return int(field)
            
            next_minute = get_next_value(minute_str, 59, now.minute)
            next_hour = get_next_value(hour_str, 23, now.hour)
            
            if next_minute >= 60:
                next_minute = next_minute % 60
                next_hour = (next_hour + 1) % 24
            
            if next_hour >= 24:
                next_hour = next_hour % 24
            
            candidate = now.replace(minute=next_minute, second=0, microsecond=0)
            candidate = candidate.replace(hour=next_hour)
            
            if candidate <= now:
                if next_minute <= now.minute:
                    next_hour = (next_hour + 1) % 24
                    candidate = candidate.replace(hour=next_hour)
                    if next_hour == 0:
                        candidate = candidate + timedelta(days=1)
            
            return candidate
        except Exception:
            return None
    
    def _describe_cron(self, cron_expression: str) -> str:
        parts = cron_expression.split()
        if len(parts) < 5:
            return "无效的Cron表达式"
        
        minute, hour, day, month, weekday = parts[0], parts[1], parts[2], parts[3], parts[4]
        
        descriptions = []
        
        if minute == "*" and hour == "*" and day == "*" and month == "*" and weekday == "*":
            return "每分钟执行"
        
        if weekday != "*":
            weekday_names = {"0": "周日", "1": "周一", "2": "周二", "3": "周三", "4": "周四", "5": "周五", "6": "周六"}
            if weekday in weekday_names:
                descriptions.append(f"每周{weekday_names[weekday]}")
        
        if day != "*":
            descriptions.append(f"每月{day}号")
        
        if hour != "*":
            descriptions.append(f"{hour}点")
        else:
            descriptions.append("每小时")
        
        if minute != "*":
            descriptions.append(f"{minute}分")
        
        return "".join(descriptions) if descriptions else "自定义调度"
    
    def _get_next_runs(self, cron_expression: str, count: int = 5) -> List[str]:
        try:
            from croniter import croniter
            base_time = datetime.now()
            cron = croniter(cron_expression, base_time)
            return [cron.get_next(datetime).strftime("%Y-%m-%d %H:%M:%S") for _ in range(count)]
        except Exception:
            return []


async def push_task_to_node(node_id: int, task_data: dict):
    from app.routers.ws_agent import manager
    return await manager.send_message(node_id, {
        "type": "task",
        "data": task_data
    })


class TaskScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler(
            jobstores={
                'default': MemoryJobStore()
            },
            timezone='Asia/Shanghai'
        )
        self.running_jobs = {}
    
    def start(self):
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Task scheduler started")
    
    def shutdown(self):
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Task scheduler shutdown")
    
    def add_job(self, task: ScheduledTask):
        if task.id in self.running_jobs:
            self.remove_job(task.id)
        
        if not task.enabled:
            return
        
        try:
            parts = task.cron_expression.split()
            if len(parts) >= 5:
                minute, hour, day, month, weekday = parts[0], parts[1], parts[2], parts[3], parts[4]
                
                job = self.scheduler.add_job(
                    self.execute_task,
                    CronTrigger(
                        minute=minute,
                        hour=hour,
                        day=day,
                        month=month,
                        day_of_week=weekday if weekday != '*' else None
                    ),
                    args=[task.id],
                    id=str(task.id),
                    name=task.name,
                    replace_existing=True
                )
                self.running_jobs[task.id] = job
                logger.info(f"Added scheduled job: {task.name} (ID: {task.id})")
        except Exception as e:
            logger.error(f"Failed to add job for task {task.id}: {e}")
    
    def remove_job(self, task_id: int):
        if task_id in self.running_jobs:
            try:
                self.scheduler.remove_job(str(task_id))
                del self.running_jobs[task_id]
                logger.info(f"Removed scheduled job: {task_id}")
            except Exception as e:
                logger.error(f"Failed to remove job {task_id}: {e}")
    
    def reload_all_jobs(self):
        db = SessionLocal()
        try:
            tasks = db.query(ScheduledTask).filter(ScheduledTask.enabled == True).all()
            for task in tasks:
                self.add_job(task)
            logger.info(f"Reloaded {len(tasks)} scheduled tasks")
        finally:
            db.close()
    
    async def execute_task(self, task_id: int):
        db = SessionLocal()
        try:
            task = db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
            if not task or not task.enabled:
                return
            
            logger.info(f"Executing scheduled task: {task.name} (ID: {task_id})")
            
            execution_id = f"task_{task_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6]}"
            
            execution = Execution(
                execution_id=execution_id,
                script_id=task.script_id,
                script_name=task.script.name if task.script else "Unknown",
                task_id=task.id,
                executor="system",
                execution_type="scheduled",
                environment=task.environment,
                status="running",
                started_at=datetime.now()
            )
            db.add(execution)
            
            target_nodes = []
            if task.execution_mode == "all":
                target_nodes = db.query(Node).filter(
                    Node.environment == task.environment,
                    Node.status == "online"
                ).all()
            else:
                node_ids = []
                if task.target_nodes:
                    node_ids = json.loads(task.target_nodes)
                target_nodes = db.query(Node).filter(
                    Node.id.in_(node_ids),
                    Node.status == "online"
                ).all() if node_ids else []
            
            execution.node_count = len(target_nodes)
            
            if not target_nodes:
                execution.status = "failed"
                execution.error_message = "No available nodes"
                execution.completed_at = datetime.now()
                db.commit()
                return
            
            for node in target_nodes:
                node_execution = NodeExecution(
                    execution_id=execution_id,
                    node_id=node.id,
                    node_name=node.name,
                    status="pending"
                )
                db.add(node_execution)
            
            db.commit()
            
            script = task.script
            
            for node in target_nodes:
                try:
                    await push_task_to_node(node.id, {
                        "execution_id": execution_id,
                        "script_id": task.script_id,
                        "script_name": script.name if script else "Unknown",
                        "script_type": script.type if script else "Python",
                        "script_content": script.content if script else "",
                        "environment": task.environment,
                        "parameters": {}
                    })
                except Exception as e:
                    logger.error(f"Failed to push task to node {node.name}: {e}")
            
            await asyncio.sleep(2)
            
            success_count = db.query(NodeExecution).filter(
                NodeExecution.execution_id == execution_id,
                NodeExecution.status == "success"
            ).count()
            
            failed_count = db.query(NodeExecution).filter(
                NodeExecution.execution_id == execution_id,
                NodeExecution.status == "failed"
            ).count()
            
            execution.success_count = success_count
            execution.failed_count = failed_count
            execution.status = "success" if failed_count == 0 else "failed"
            execution.completed_at = datetime.now()
            
            if execution.started_at:
                duration = (execution.completed_at - execution.started_at).total_seconds()
                execution.duration = int(duration)
            
            task.last_run_time = datetime.now()
            task.last_run_status = execution.status
            
            next_run = self._calculate_next_run_time(task.cron_expression)
            if next_run:
                task.next_run_time = next_run
            
            db.commit()
            logger.info(f"Completed scheduled task: {task.name}, status: {execution.status}")
            
        except Exception as e:
            logger.error(f"Error executing scheduled task {task_id}: {e}")
            try:
                execution = db.query(Execution).filter(
                    Execution.task_id == task_id,
                    Execution.status == "running"
                ).first()
                if execution:
                    execution.status = "failed"
                    execution.error_message = str(e)
                    execution.completed_at = datetime.now()
                    db.commit()
            except:
                pass
        finally:
            db.close()
    
    def _calculate_next_run_time(self, cron_expression: str):
        try:
            from croniter import croniter
            base_time = datetime.now()
            cron = croniter(cron_expression, base_time)
            return cron.get_next(datetime)
        except:
            return None


scheduler = TaskScheduler()
