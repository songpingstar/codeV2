from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import os


os.makedirs("data", exist_ok=True)

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL"))
        conn.commit()
        
        result = conn.execute(text("PRAGMA table_info(nodes)")).fetchall()
        columns = [row[1] for row in result]
        if 'node_token' not in columns:
            conn.execute(text("ALTER TABLE nodes ADD COLUMN node_token VARCHAR(64) NOT NULL DEFAULT ''"))
            conn.commit()
            print("nodes表已添加node_token字段")
    
    from app.models import ScriptCategory, RegistrationToken
    from sqlalchemy.orm import Session
    
    session = Session(bind=engine)
    try:
        existing = session.query(ScriptCategory).first()
        if not existing:
            categories = [
                ScriptCategory(name="监控告警", description="系统监控和告警相关脚本", color="red", sort_order=1),
                ScriptCategory(name="备份恢复", description="数据备份和恢复脚本", color="blue", sort_order=2),
                ScriptCategory(name="日志分析", description="日志收集和分析脚本", color="green", sort_order=3),
                ScriptCategory(name="自动化运维", description="日常运维自动化脚本", color="purple", sort_order=4),
            ]
            session.add_all(categories)
            session.commit()
            print("初始脚本分类数据已创建")
        
        has_token = session.query(RegistrationToken).first()
        if not has_token:
            from datetime import datetime, timedelta
            import secrets
            token = secrets.token_hex(16)
            expires_at = datetime.now() + timedelta(hours=24)
            reg_token = RegistrationToken(
                token=token,
                status="pending",
                expires_at=expires_at
            )
            session.add(reg_token)
            session.commit()
            print(f"初始Token已创建: {token}")
    finally:
        session.close()