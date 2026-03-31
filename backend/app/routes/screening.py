import os
import uuid
import shutil
import aiofiles
from typing import List, Dict, Optional
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models import (
    CandidateSchema, CandidateStatus, JobDescription, AnalysisRequest,
    UploadResponse, AnalysisResponse, ContactInfo, Skill, Experience, Education, JobSchema,
    CandidatesListResponse,
    db_models
)
from ..models.database import get_db
from ..services import resume_parser, ai_analyzer, candidate_matcher, email_service, duplicate_detector
from ..config import get_settings

router = APIRouter(prefix="/api", tags=["Resume Screening"])

# Screening progress is fine in-memory as it's transient
screening_progress: Dict[str, any] = {"status": "idle", "progress": 0, "current_file": ""}
current_job_description: Optional[JobDescription] = None

settings = get_settings()

@router.post("/upload", response_model=UploadResponse)
async def upload_resumes(
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Upload multiple resume files for processing and save to database"""
    successful = 0
    failed = 0
    new_candidates = []
    
    for file in files:
        try:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in {'.pdf', '.docx', '.doc'}:
                failed += 1
                continue
            
            candidate_id = str(uuid.uuid4())
            file_path = os.path.join(settings.upload_folder, f"{candidate_id}{ext}")
            
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            db_candidate = db_models.Candidate(
                id=candidate_id,
                name="Pending Analysis",
                status=CandidateStatus.PENDING,
                created_at=datetime.utcnow()
            )
            db.add(db_candidate)
            new_candidates.append(db_candidate)
            successful += 1
        except Exception as e:
            failed += 1
            print(f"Error uploading {file.filename}: {str(e)}")
    
    db.commit()
    return UploadResponse(
        message=f"Uploaded {successful} files successfully",
        total_files=len(files),
        successful=successful,
        failed=failed,
        candidates=[CandidateSchema(id=c.id, name=c.name, filename="", status=CandidateStatus.PENDING) for c in new_candidates]
    )

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resumes(request: AnalysisRequest, db: Session = Depends(get_db)):
    """Analyze uploaded resumes against job description and save to DB"""
    global current_job_description, screening_progress
    current_job_description = request.job_description
    
    if request.resume_ids:
        db_candidates = db.query(db_models.Candidate).filter(db_models.Candidate.id.in_(request.resume_ids)).all()
    else:
        db_candidates = db.query(db_models.Candidate).filter(db_models.Candidate.status == CandidateStatus.PENDING).all()
    
    if not db_candidates:
        raise HTTPException(status_code=400, detail="No pending candidates found to analyze")
    
    # Job logic
    batch_job_id = request.job_id
    if not batch_job_id:
        db_job = db.query(db_models.Job).filter(db_models.Job.title.ilike(request.job_description.title)).first()
        if db_job:
            batch_job_id = db_job.id
        else:
            batch_job_id = str(uuid.uuid4())
            db_job = db_models.Job(
                id=batch_job_id,
                title=request.job_description.title,
                description=request.job_description.description,
                required_skills=request.job_description.required_skills,
                preferred_skills=request.job_description.preferred_skills,
                min_experience=request.job_description.min_experience_years
            )
            db.add(db_job)
            db.commit()
    else:
        db_job = db.query(db_models.Job).filter(db_models.Job.id == batch_job_id).first()
        if not db_job:
            db_job = db_models.Job(
                id=batch_job_id,
                title=request.job_description.title,
                description=request.job_description.description,
                required_skills=request.job_description.required_skills,
                preferred_skills=request.job_description.preferred_skills,
                min_experience=request.job_description.min_experience_years
            )
            db.add(db_job)
            db.commit()

    total = len(db_candidates)
    analyzed_candidates_history = []

    for idx, candidate in enumerate(db_candidates):
        screening_progress = {"status": "analyzing", "progress": int((idx / total) * 100), "current_file": candidate.name, "step": "parsing"}
        
        file_path = None
        for ext in ['.pdf', '.docx', '.doc']:
            potential_path = os.path.join(settings.upload_folder, f"{candidate.id}{ext}")
            if os.path.exists(potential_path):
                file_path = potential_path
                break
        
        if not file_path: continue
        
        resume_text = resume_parser.parse_file(file_path)
        if not resume_text:
            candidate.status = CandidateStatus.ANALYZED
            db.commit()
            continue
            
        jd_dict = {
            "title": db_job.title,
            "description": db_job.description,
            "required_skills": db_job.required_skills or [],
            "preferred_skills": db_job.preferred_skills or [],
            "min_experience_years": db_job.min_experience or 0
        }
        
        analysis = await ai_analyzer.analyze_resume(resume_text, jd_dict)
        
        candidate.name = analysis.get("name", candidate.name)
        candidate.email = analysis.get("contact", {}).get("email")
        candidate.phone = analysis.get("contact", {}).get("phone")
        candidate.location = analysis.get("contact", {}).get("location")
        candidate.linkedin = analysis.get("contact", {}).get("linkedin")
        candidate.github = analysis.get("contact", {}).get("github")
        candidate.summary = analysis.get("summary", "")
        candidate.total_experience = analysis.get("total_experience_years", 0)
        candidate.strengths = analysis.get("strengths", [])
        candidate.concerns = analysis.get("concerns", [])
        candidate.matched_skills = analysis.get("matched_skills", [])
        candidate.missing_skills = analysis.get("missing_skills", [])
        candidate.ai_recommendation = analysis.get("ai_recommendation", "")
        # Save AI-provided scores directly — do NOT re-score with empty skills later
        candidate.match_score = float(analysis.get("match_score", 0) or 0)
        candidate.status = CandidateStatus.ANALYZED
        candidate.analyzed_at = datetime.utcnow()
        candidate.job_id = batch_job_id
        candidate.analysis_json = analysis
        
        db.commit()
        
        # Build schema with the AI score already set
        c_schema = CandidateSchema(
            id=candidate.id,
            name=candidate.name,
            filename="",
            status=CandidateStatus.ANALYZED,
            match_score=candidate.match_score,
            total_experience_years=candidate.total_experience,
            summary=candidate.summary,
            strengths=candidate.strengths,
            concerns=candidate.concerns,
            missing_skills=candidate.missing_skills,
            matched_skills=candidate.matched_skills,
            ai_recommendation=candidate.ai_recommendation
        )
        analyzed_candidates_history.append(c_schema)

    # Sort by AI score (already saved to DB) — do NOT re-run calculate_match with empty skills
    analyzed_candidates_history.sort(key=lambda x: x.match_score, reverse=True)
    
    screening_progress = {"status": "complete", "progress": 100, "current_file": ""}
    return AnalysisResponse(message=f"Analyzed {len(analyzed_candidates_history)} candidates", total_analyzed=len(analyzed_candidates_history), candidates=analyzed_candidates_history)

@router.get("/candidates", response_model=CandidatesListResponse)
async def get_candidates(status: Optional[str] = None, min_score: Optional[float] = None, job_id: Optional[str] = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(db_models.Candidate)
    if status: query = query.filter(db_models.Candidate.status == status)
    if min_score is not None: query = query.filter(db_models.Candidate.match_score >= min_score)
    if job_id: query = query.filter(db_models.Candidate.job_id == job_id)
    
    candidates = query.order_by(db_models.Candidate.match_score.desc()).limit(limit).all()
    # Pydantic will handle the mapping from db_models.Candidate to CandidateSchema
    return {"candidates": candidates, "total": query.count()}

@router.get("/jobs")
async def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(db_models.Job).all()
    # Add counts
    results = []
    for job in jobs:
        count = db.query(db_models.Candidate).filter(db_models.Candidate.job_id == job.id).count()
        results.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "candidate_count": count
        })
    return {"jobs": results}

@router.get("/candidates/{candidate_id}", response_model=CandidateSchema)
async def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    candidate = db.query(db_models.Candidate).filter(db_models.Candidate.id == candidate_id).first()
    if not candidate: raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.post("/candidates/{candidate_id}/shortlist")
async def shortlist_candidate(candidate_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    candidate = db.query(db_models.Candidate).filter(db_models.Candidate.id == candidate_id).first()
    if not candidate: raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate.status = CandidateStatus.SHORTLISTED
    db.commit()
    
    if background_tasks and candidate.email:
        job_title = candidate.job.title if candidate.job else "Position"
        background_tasks.add_task(email_service.notify_shortlisted, candidate.name, candidate.email, job_title)
        
    return {"message": "Candidate shortlisted"} # Return simpler response to avoid circularity if possible

@router.get("/shortlisted")
async def get_shortlisted_candidates(db: Session = Depends(get_db)):
    """Get all shortlisted candidates from database"""
    candidates = db.query(db_models.Candidate).filter(db_models.Candidate.status == CandidateStatus.SHORTLISTED).order_by(db_models.Candidate.analyzed_at.desc()).all()
    # Normalize for frontend (ShortlistedView expects certain names)
    results = []
    for c in candidates:
        results.append({
            "id": c.id,
            "name": c.name,
            "job_title": c.job.title if c.job else "Unknown Role",
            "match_score": c.match_score or 0,
            "shortlisted_at": c.analyzed_at or c.created_at,
            "key_strengths": ", ".join(c.strengths) if c.strengths else "N/A",
            "why_shortlisted": c.ai_recommendation or "Highly qualified candidate",
            "analytics_json": c.analysis_json
        })
    return {"shortlisted": results}

@router.post("/candidates/{candidate_id}/reject")
async def reject_candidate(candidate_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    candidate = db.query(db_models.Candidate).filter(db_models.Candidate.id == candidate_id).first()
    if not candidate: raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate.status = CandidateStatus.REJECTED
    db.commit()
    
    return {"message": "Candidate rejected"}

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    candidates = db.query(db_models.Candidate).all()
    total = len(candidates)
    if total == 0: return {"total": 0, "analyzed": 0, "shortlisted": 0, "rejected": 0, "pending": 0, "average_score": 0, "top_skills": [], "top_candidates": []}
    
    shortlisted = len([c for c in candidates if c.status == CandidateStatus.SHORTLISTED])
    rejected = len([c for c in candidates if c.status == CandidateStatus.REJECTED])
    analyzed = len([c for c in candidates if c.status == CandidateStatus.ANALYZED])
    pending = len([c for c in candidates if c.status == CandidateStatus.PENDING])
    
    avg_score = sum(c.match_score or 0 for c in candidates) / total
    
    # Storytelling Insights
    strength_counts = {}
    for c in [c for c in candidates if (c.status == CandidateStatus.SHORTLISTED or (c.match_score or 0) > 70)]:
        if c.strengths:
            for s in c.strengths: strength_counts[s] = strength_counts.get(s, 0) + 1
            
    missing_counts = {}
    for c in [c for c in candidates if (c.status == CandidateStatus.REJECTED or (c.match_score or 0) < 40)]:
        if c.missing_skills:
            for s in c.missing_skills: missing_counts[s] = missing_counts.get(s, 0) + 1

    # Skill demand
    skill_counts = {}
    for c in candidates:
        if c.analysis_json and "skills" in c.analysis_json:
            for s in c.analysis_json["skills"]:
                name = s.get("name")
                if name: skill_counts[name] = skill_counts.get(name, 0) + 1

    return {
        "total": total,
        "analyzed": analyzed,
        "shortlisted": shortlisted,
        "rejected": rejected,
        "pending": pending,
        "average_score": round(avg_score, 1),
        "top_skills": sorted([{"name": k, "count": v} for k, v in skill_counts.items()], key=lambda x: x["count"], reverse=True)[:10],
        "top_candidates": [{"name": c.name, "score": c.match_score} for c in sorted(candidates, key=lambda x: x.match_score or 0, reverse=True)[:5]],
        "insights": {
            "job_title": "Active Roles",
            "common_strengths": sorted(strength_counts.items(), key=lambda x: x[1], reverse=True)[:5],
            "common_missing_skills": sorted(missing_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        }
    }

@router.get("/progress")
async def get_screening_progress():
    return screening_progress

@router.delete("/candidates")
async def clear_candidates(db: Session = Depends(get_db)):
    db.query(db_models.Candidate).delete()
    db.commit()
    # Clean up files
    if os.path.exists(settings.upload_folder):
        shutil.rmtree(settings.upload_folder)
        os.makedirs(settings.upload_folder)
    return {"message": "All candidates cleared"}
