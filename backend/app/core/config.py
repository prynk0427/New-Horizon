from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "New Horizon"
    debug: bool = False
    secret_key: str = "change-this-in-production"

    # Database
    database_url: str = "sqlite:///./new_horizon.db"

    # AI
    gemini_api_key: Optional[str] = None

    # CORS
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
