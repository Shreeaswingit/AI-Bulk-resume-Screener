from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import screening_router, auth_router
from .config import get_settings
from .models.database import engine, Base
from .models import db_models # Import all models here
import logging

# Initialize database
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

settings = get_settings()

app = FastAPI(
    title="AI Resume Screener API",
    description="AI-powered resume screening and candidate evaluation system",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(screening_router)
app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "message": "AI Resume Screener API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    from .services import ai_analyzer
    ai_status = ai_analyzer.get_status()
    return {
        "status": "healthy",
        "ai_status": ai_status.get("status", "unknown"),
        "ai_error": ai_status.get("error"),
        "ai_provider": ai_status.get("provider"),
        "gemini_configured": ai_status.get("gemini_configured", False),
        "openrouter_configured": ai_status.get("openrouter_configured", False)
    }

