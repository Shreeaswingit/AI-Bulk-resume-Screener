from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class CandidateStatus(str, Enum):
    PENDING = "pending"
    ANALYZED = "analyzed"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"

class Skill(BaseModel):
    name: str
    proficiency: Optional[str] = None
    years: Optional[float] = None
    matched: bool = False

class Experience(BaseModel):
    company: str
    title: str
    duration: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class Education(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    year: Optional[str] = None
    gpa: Optional[str] = None

class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None

class Candidate(BaseModel):
    id: str
    name: str
    filename: str
    status: CandidateStatus = CandidateStatus.PENDING
    contact: Optional[ContactInfo] = None
    summary: Optional[str] = None
    skills: List[Skill] = []
    experience: List[Experience] = []
    education: List[Education] = []
    total_experience_years: Optional[float] = None
    match_score: float = 0.0
    skill_match_percentage: float = 0.0
    strengths: List[str] = []
    concerns: List[str] = []
    ai_recommendation: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    analyzed_at: Optional[datetime] = None

class JobDescription(BaseModel):
    title: str
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    min_experience_years: Optional[float] = None
    education_requirements: Optional[str] = None

class AnalysisRequest(BaseModel):
    job_description: JobDescription
    resume_ids: Optional[List[str]] = None

class UploadResponse(BaseModel):
    message: str
    total_files: int
    successful: int
    failed: int
    candidates: List[Candidate]

class AnalysisResponse(BaseModel):
    message: str
    total_analyzed: int
    candidates: List[Candidate]

class ScreeningProgress(BaseModel):
    current_file: str
    current_step: str  # parsing, analyzing, scoring
    progress_percent: float
    total_files: int
    completed_files: int
