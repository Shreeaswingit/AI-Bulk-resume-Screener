from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import screening_router
from .config import get_settings
import logging

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


@app.get("/")
async def root():
    return {
        "message": "AI Resume Screener API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "api_configured": bool(settings.gemini_api_key)}
