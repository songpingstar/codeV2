from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, index=True)
    type = Column(String(20), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("script_categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    description = Column(Text)
    maintainer = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default="active", index=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    category = relationship("ScriptCategory", backref="scripts")
    creator = relationship("User", backref="created_scripts")