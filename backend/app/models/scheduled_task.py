from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class ScheduledTask(Base):
    __tablename__ = "scheduled_tasks"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    script_id = Column(Integer, ForeignKey("scripts.id", ondelete="RESTRICT"), nullable=False, index=True)
    cron_expression = Column(String(100), nullable=False)
    cron_description = Column(String(200))
    environment = Column(String(20), nullable=False)
    execution_mode = Column(String(20), nullable=False, default="all")
    target_nodes = Column(Text)
    enabled = Column(Boolean, nullable=False, default=True, index=True)
    last_run_time = Column(DateTime)
    last_run_status = Column(String(20))
    next_run_time = Column(DateTime, index=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    
    script = relationship("Script", backref="scheduled_tasks")
    creator = relationship("User", backref="created_tasks")