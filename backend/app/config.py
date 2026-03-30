from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    app_name: str = "AI Resume Screener"
    debug: bool = True
    gemini_api_key: str = ""
    openrouter_api_key: str = ""
    openrouter_model: str = "google/gemini-2.0-flash-exp:free"
    upload_folder: str = "./uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    rate_limit_enabled: bool = False
    rate_limit_delay: int = 5
    
    # Email Settings
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 465
    smtp_user: str = ""
    smtp_password: str = ""  # This should be an App Password, not your regular password
    smtp_from: str = ""
    
    # Database Settings
    database_url: str = "sqlite:///./shortlisted.db"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()
