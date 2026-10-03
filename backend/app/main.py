from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .config import settings
from .database import engine, Base, SessionLocal
from .utils.seed_data import seed_database
from .api import (
    auth,
    analysis,
    datasets,
    feedback,
    dashboard,
    insights,
    trends,
    models,
    reports,
    settings as settings_api,
    notifications
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed realistic demo data on startup if configured
    if settings.SEED_DEMO_DATA:
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
            
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise AI Sentiment & Emotion Intelligence API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(analysis.router, prefix=settings.API_PREFIX)
app.include_router(datasets.router, prefix=settings.API_PREFIX)
app.include_router(feedback.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(insights.router, prefix=settings.API_PREFIX)
app.include_router(trends.router, prefix=settings.API_PREFIX)
app.include_router(models.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(settings_api.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SentinelAI API",
        "version": settings.VERSION,
        "engine": "Sentinel Neural Hybrid",
        "status_code": 200
    }

# Serve Frontend static assets for production
dist_path = settings.BASE_DIR.parent / "frontend" / "dist"
if dist_path.exists():
    app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="frontend")

