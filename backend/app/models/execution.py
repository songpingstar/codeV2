from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class Execution(Base):
    __tablename__ = "executions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    execution_id = Column(String(50), unique=True, nullable=False, index=True)
    script_id = Column(Integer, ForeignKey("scripts.id", ondelete="RESTRICT"), nullable=False, index=True)
    script_name = Column(String(100), nullable=False)
    task_id = Column(Integer, ForeignKey("scheduled_tasks.id", ondelete="SET NULL"), index=True)
    executor = Column(String(50), nullable=False, index=True)
    execution_type = Column(String(20), nullable=False)
    environment = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    node_count = Column(Integer, nullable=False, default=0)
    success_count = Column(Integer, nullable=False, default=0)
    failed_count = Column(Integer, nullable=False, default=0)
    duration = Column(Integer)
    error_message = Column(Text)
    started_at = Column(DateTime, index=True)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    
    script = relationship("Script", backref="executions")
    task = relationship("ScheduledTask", backref="executions")
    node_executions = relationship("NodeExecution", back_populates="execution")