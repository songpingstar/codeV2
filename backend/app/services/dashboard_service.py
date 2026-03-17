from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models import Execution, Script, Node


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_stats(self) -> Dict[str, Any]:
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = (today_start - timedelta(days=1))
        
        today_executions = self.db.query(Execution).filter(
            Execution.created_at >= today_start
        ).count()
        
        yesterday_executions = self.db.query(Execution).filter(
            Execution.created_at >= yesterday_start,
            Execution.created_at < today_start
        ).count()
        
        executions_change = 0
        if yesterday_executions > 0:
            executions_change = round((today_executions - yesterday_executions) / yesterday_executions * 100, 1)
        elif today_executions > 0:
            executions_change = 100.0
        
        today_success = self.db.query(Execution).filter(
            Execution.created_at >= today_start,
            Execution.status == "success"
        ).count()
        today_success_rate = round(today_success / today_executions * 100, 1) if today_executions > 0 else 0.0
        
        yesterday_success = self.db.query(Execution).filter(
            Execution.created_at >= yesterday_start,
            Execution.created_at < today_start,
            Execution.status == "success"
        ).count()
        yesterday_success_rate = round(yesterday_success / yesterday_executions * 100, 1) if yesterday_executions > 0 else 0.0
        
        rate_change = round(today_success_rate - yesterday_success_rate, 1)
        
        total_executions = self.db.query(Execution).count()
        success_executions = self.db.query(Execution).filter(
            Execution.status == "success"
        ).count()
        success_rate = round(success_executions / total_executions * 100, 1) if total_executions > 0 else 0.0
        
        total_nodes = self.db.query(Node).count()
        online_nodes = self.db.query(Node).filter(
            Node.status == "online"
        ).count()
        
        return {
            "today_executions": today_executions,
            "executions_change": executions_change,
            "today_success_rate": today_success_rate,
            "success_rate": success_rate,
            "success_rate_change": rate_change,
            "online_nodes": online_nodes,
            "total_nodes": total_nodes
        }
    
    def get_script_distribution(self) -> Dict[str, int]:
        python_count = self.db.query(Script).filter(
            Script.type == "Python"
        ).count()
        
        shell_count = self.db.query(Script).filter(
            Script.type == "Shell"
        ).count()
        
        go_count = self.db.query(Script).filter(
            Script.type == "Go"
        ).count()
        
        return {
            "python": python_count,
            "shell": shell_count,
            "go": go_count
        }
    
    def get_task_stats(self) -> Dict[str, int]:
        scheduled_count = self.db.query(Execution).filter(
            Execution.execution_type == "scheduled"
        ).count()
        
        manual_count = self.db.query(Execution).filter(
            Execution.execution_type == "manual"
        ).count()
        
        return {
            "scheduled": scheduled_count,
            "triggered": 0,
            "manual": manual_count
        }
    
    def get_recent_executions(self, limit: int = 5) -> List[Dict[str, Any]]:
        executions = self.db.query(Execution).order_by(
            Execution.created_at.desc()
        ).limit(limit).all()
        
        result = []
        for exec_item in executions:
            duration_str = f"{exec_item.duration}s" if exec_item.duration else "-"
            started_at_str = exec_item.started_at.strftime("%Y-%m-%d %H:%M:%S") if exec_item.started_at else "-"
            
            result.append({
                "id": str(exec_item.id),
                "script_name": exec_item.script_name,
                "status": exec_item.status,
                "node": f"{exec_item.node_count}个节点",
                "start_time": started_at_str,
                "duration": duration_str
            })
        
        return result
