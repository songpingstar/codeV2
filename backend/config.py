from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "运维任务调度系统"
    app_version: str = "1.0.0"
    
    database_url: str = "sqlite:///./data/scheduler.db"
    
    api_prefix: str = "/api/v1"
    
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"


settings = Settings()