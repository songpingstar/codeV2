from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class NodeExecution(Base):
    __tablename__ = "node_executions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    execution_id = Column(String(50), ForeignKey("executions.execution_id", ondelete="CASCADE"), nullable=False, index=True)
    node_id = Column(Integer, ForeignKey("nodes.id", ondelete="RESTRICT"), nullable=False, index=True)
    node_name = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    exit_code = Column(Integer)
    duration = Column(Integer)
    log_content = Column(Text)
    error_message = Column(Text)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    
    execution = relationship("Execution", back_populates="node_executions")
    node = relationship("Node", backref="node_executions")