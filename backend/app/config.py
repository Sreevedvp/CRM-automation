import os
from pydantic_settings import BaseSettings

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "CRM Automation Engine"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./crm_automation.db")
    
    # Real Email (SMTP) Configuration
    ENABLE_REAL_EMAIL: bool = True
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    EMAIL_FROM: str = ""
    
    # WhatsApp Cloud API Configuration
    WHATSAPP_API_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    
    # AI Engine Config
    AI_PROVIDER: str = "mock" # options: mock, openai, gemini, ollama
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    class Config:
        env_file = env_path
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
