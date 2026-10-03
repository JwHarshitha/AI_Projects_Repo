import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PROJECT_NAME: str = "SentinelAI – AI Sentiment Intelligence Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    BASE_DIR: Path = BASE_DIR
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sentinel-ai-super-secret-production-key-2025-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/sentinel.db")
    
    # Storage
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    DATA_DIR: Path = BASE_DIR.parent / "data"
    
    # Active Sentiment Engine
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "hybrid") # hybrid, tfidf, transformer
    ACTIVE_MODEL: str = os.getenv("ACTIVE_MODEL", "TF-IDF + Logistic Regression (Calibrated)")
    
    # Demo Seed
    SEED_DEMO_DATA: bool = True

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
