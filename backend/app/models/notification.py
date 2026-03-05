from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    notification_type = Column(String(20), nullable=False, index=True)
    recipient = Column(String(200), nullable=False)
    subject = Column(String(200))
    content = Column(Text)
    status = Column(String(20), nullable=False, default="pending", index=True)
    error_message = Column(Text)
    related_execution_id = Column(String(50))
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp(), index=True)
    sent_at = Column(DateTime)