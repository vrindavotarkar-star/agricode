from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    # Database
    database_url: str = Field(default="sqlite:///./kisan_call_centre.db")

    # JWT
    secret_key: str = Field(default="your-secret-key-here-change-in-production")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)

    # Watsonx AI
    watsonx_api_key: str = Field(default="")
    watsonx_url: str = Field(default="")
    watsonx_project_id: str = Field(default="")

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
