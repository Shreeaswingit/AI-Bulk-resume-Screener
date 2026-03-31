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
    match_score: float = 0.0

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
    job_id: Optional[str] = None
    job_title: Optional[str] = None
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
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    improvement_suggestions: List[str] = []
    recommendation_category: Optional[str] = None # Selected, Considered, Rejected
    ai_recommendation: Optional[str] = None
    duplicate_of: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    analyzed_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}

class JobDescription(BaseModel):
    title: str
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    min_experience_years: Optional[float] = None
    education_requirements: Optional[str] = None

class Job(BaseModel):
    id: str
    title: str
    description: str
    created_at: datetime = Field(default_factory=datetime.now)
    candidate_count: int = 0
    avg_score: float = 0.0
    
    model_config = {"from_attributes": True}

class CandidatesListResponse(BaseModel):
    candidates: List[Candidate]
    total: int

class AnalysisRequest(BaseModel):
    job_id: Optional[str] = None # Link to existing job
    job_description: JobDescription # Or create from new JD
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
