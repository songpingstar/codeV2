from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class Node(Base):
    __tablename__ = "nodes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    ip = Column(String(50), nullable=False, index=True)
    environment = Column(String(20), nullable=False, index=True)
    tags = Column(Text)
    status = Column(String(20), nullable=False, default="offline", index=True)
    last_heartbeat = Column(DateTime)
    cpu_usage = Column(String(10))
    memory_usage = Column(String(10))
    disk_usage = Column(String(10))
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())