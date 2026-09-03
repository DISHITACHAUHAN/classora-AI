import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "CLASSORA AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "classora_ai_hackathon_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./classora.db")

    # Agora Credentials
    AGORA_APP_ID: str = os.getenv("AGORA_APP_ID", "a1b2c3d4e5f6g7h8i9j0classora001")
    AGORA_APP_CERTIFICATE: str = os.getenv("AGORA_APP_CERTIFICATE", "cert_secret_classora_ai_voice_2026")
    AGORA_CUSTOMER_ID: str = os.getenv("AGORA_CUSTOMER_ID", "")
    AGORA_CUSTOMER_SECRET: str = os.getenv("AGORA_CUSTOMER_SECRET", "")
    AGORA_REST_URL: str = os.getenv("AGORA_REST_URL", "https://api.agora.io/api/conversational-ai-agent/v2")

    # AI Model Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
