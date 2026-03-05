from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class SystemConfig(Base):
    __tablename__ = "system_configs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    config_key = Column(String(100), unique=True, nullable=False, index=True)
    config_value = Column(Text, nullable=False)
    config_type = Column(String(20), nullable=False, default="string")
    description = Column(Text)
    category = Column(String(50), nullable=False, index=True)
    updated_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())