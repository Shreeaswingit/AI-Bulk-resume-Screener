from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import screening_router, auth_router
from .config import get_settings
from .models.database import engine, Base, SessionLocal
from .models import db_models # Import all models here
import logging
from passlib.context import CryptContext

logger = logging.getLogger("uvicorn.error")

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

@app.on_event("startup")
async def startup_event():
    # Initialize database
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully.")
        
        # Create default admin user if it doesn't exist
        db = SessionLocal()
        try:
            admin_user = db.query(db_models.User).filter(db_models.User.username == "admin").first()
            if not admin_user:
                hashed_password = pwd_context.hash("admin")
                new_admin = db_models.User(
                    username="admin",
                    password_hash=hashed_password,
                    full_name="Administrator"
                )
                db.add(new_admin)
                db.commit()
                logger.info("Default admin user created.")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "AI Resume Screener API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
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
