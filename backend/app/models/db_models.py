from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Job(Base):
    __tablename__ = "jobs"
    id = Column(String, primary_key=True, index=True) # UUID
    title = Column(String, index=True)
    description = Column(Text)
    required_skills = Column(JSON)
    preferred_skills = Column(JSON)
    min_experience = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    candidates = relationship("Candidate", back_populates="job")

class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(String, primary_key=True, index=True) # UUID
    job_id = Column(String, ForeignKey("jobs.id"), nullable=True)
    name = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    location = Column(String)
    linkedin = Column(String)
    github = Column(String)
    summary = Column(Text)
    total_experience = Column(Float)
    match_score = Column(Float, default=0.0)
    status = Column(String, default="pending") # pending, analyzed, shortlisted, rejected
    
    # Matching Info
    strengths = Column(JSON)
    concerns = Column(JSON)
    matched_skills = Column(JSON)
    missing_skills = Column(JSON)
    ai_recommendation = Column(Text)
    why_shortlisted = Column(Text)
    
    # Raw Analysis for details
    analysis_json = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    analyzed_at = Column(DateTime, nullable=True)
    job = relationship("Job", back_populates="candidates")
