from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from datetime import datetime
from .database import Base

class ShortlistedCandidate(Base):
    __tablename__ = "shortlisted_candidates"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    job_id = Column(String, index=True)
    job_title = Column(String)
    shortlisted_at = Column(DateTime, default=datetime.utcnow)
    
    # Analytics details
    match_score = Column(Float)
    key_strengths = Column(Text) # Stored as comma-separated or JSON
    why_shortlisted = Column(Text) # AI recommendation/summary
    analytics_json = Column(JSON) # Store full analysis for depth
