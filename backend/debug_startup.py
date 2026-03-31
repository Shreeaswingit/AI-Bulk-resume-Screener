
import sys
import os

print("Starting debug import...")
try:
    print("Importing FastAPI...")
    from fastapi import FastAPI
    print("Importing CORSMiddleware...")
    from fastapi.middleware.cors import CORSMiddleware
    print("Importing config...")
    from app.config import get_settings
    print("Importing database...")
    from app.models.database import engine, Base
    print("Importing db_models...")
    from app.models import db_models
    print("Importing routes...")
    from app.routes import screening_router, auth_router

    app = FastAPI()
    print("FastAPI initialized.")
    
    print("Running create_all...")
    Base.metadata.create_all(bind=engine)
    print("create_all finished.")
    
    print("Import successful.")
except Exception as e:
    print(f"Import failed with error: {str(e)}")
    import traceback
    traceback.print_exc()
