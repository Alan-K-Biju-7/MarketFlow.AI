import os
from functools import lru_cache
from typing import List

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class Settings(BaseModel):
    app_name: str = "MarketFlow AI API"
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    origins = os.getenv("CORS_ORIGINS")
    if origins:
        cors_origins = [origin.strip() for origin in origins.split(",") if origin.strip()]
        return Settings(cors_origins=cors_origins)
    return Settings()
