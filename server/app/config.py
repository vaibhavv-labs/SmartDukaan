"""
KiranaMind AI — Application Configuration
Loads environment variables via pydantic-settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "KiranaMind AI"
    app_env: str = "development"
    debug: bool = True

    # Database
    database_url: str = "sqlite:///./kiranamind.db"

    # JWT Auth
    jwt_secret_key: str = "kiranamind-dev-secret-key-2026"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
