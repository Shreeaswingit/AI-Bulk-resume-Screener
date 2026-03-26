import os
import uuid
import shutil
import aiofiles
from typing import List, Dict, Optional
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from ..models import (
    Candidate, CandidateStatus, JobDescription, AnalysisRequest,
    UploadResponse, AnalysisResponse, ContactInfo, Skill, Experience, Education, Job
)
from ..services import resume_parser, ai_analyzer, candidate_matcher, email_service, duplicate_detector
from ..config import get_settings

router = APIRouter(prefix="/api", tags=["Resume Screening"])

# In-memory storage (replace with database in production)
candidates_db: Dict[str, Candidate] = {}
jobs_db: Dict[str, Job] = {}
current_job_description: Optional[JobDescription] = None
screening_progress: Dict[str, any] = {"status": "idle", "progress": 0, "current_file": ""}

settings = get_settings()

# Ensure upload folder exists
os.makedirs(settings.upload_folder, exist_ok=True)


@router.post("/upload", response_model=UploadResponse)
async def upload_resumes(
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = None
):
    """Upload multiple resume files for processing"""
    
    successful = 0
    failed = 0
    new_candidates = []
    
    for file in files:
        try:
            # Validate file type
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in {'.pdf', '.docx', '.doc'}:
                failed += 1
                continue
            
            # Generate unique ID and save file
            candidate_id = str(uuid.uuid4())
            file_path = os.path.join(settings.upload_folder, f"{candidate_id}{ext}")
            
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Create candidate record
            candidate = Candidate(
                id=candidate_id,
                name="Pending Analysis",
                filename=file.filename,
                status=CandidateStatus.PENDING
            )
            
            candidates_db[candidate_id] = candidate
            new_candidates.append(candidate)
            successful += 1
            
        except Exception as e:
            failed += 1
            print(f"Error uploading {file.filename}: {str(e)}")
    
    return UploadResponse(
        message=f"Uploaded {successful} files successfully",
        total_files=len(files),
        successful=successful,
        failed=failed,
        candidates=new_candidates
    )


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resumes(request: AnalysisRequest):
    """Analyze uploaded resumes against job description"""
    global current_job_description, screening_progress
    
    current_job_description = request.job_description
    
    # Get candidates to analyze
    if request.resume_ids:
        candidates_to_analyze = [
            candidates_db[cid] for cid in request.resume_ids
            if cid in candidates_db
        ]
    else:
        candidates_to_analyze = [
            c for c in candidates_db.values()
            if c.status == CandidateStatus.PENDING
        ]
    
    if not candidates_to_analyze:
        raise HTTPException(status_code=400, detail="No candidates to analyze")
    
    analyzed_candidates = []
    total = len(candidates_to_analyze)
    
    # Determine the job ID for this analysis batch
    batch_job_id = request.job_id
    if not batch_job_id:
        # Check if a job with this title already exists
        for j_id, job in jobs_db.items():
            if job.title.lower() == request.job_description.title.lower():
                batch_job_id = j_id
                break
        
        # If no matching job exists, create a new one
        if not batch_job_id:
            batch_job_id = str(uuid.uuid4())
            jobs_db[batch_job_id] = Job(
                id=batch_job_id,
                title=request.job_description.title,
                description=request.job_description.description
            )
    else:
        # If job_id is provided, ensure it exists in the jobs database
        if batch_job_id not in jobs_db:
            jobs_db[batch_job_id] = Job(
                id=batch_job_id,
                title=request.job_description.title,
                description=request.job_description.description
            )
            
    for idx, candidate in enumerate(candidates_to_analyze):
        screening_progress = {
            "status": "analyzing",
            "progress": int((idx / total) * 100),
            "current_file": candidate.filename,
            "step": "parsing"
        }
        
        # Find the file
        file_path = None
        for ext in ['.pdf', '.docx', '.doc']:
            potential_path = os.path.join(settings.upload_folder, f"{candidate.id}{ext}")
            if os.path.exists(potential_path):
                file_path = potential_path
                break
        
        if not file_path:
            continue
        
        # Parse resume
        screening_progress["step"] = "parsing"
        resume_text = resume_parser.parse_file(file_path)
        
        if not resume_text:
            candidate.status = CandidateStatus.ANALYZED
            candidate.concerns = ["Could not parse resume file"]
            candidates_db[candidate.id] = candidate
            continue
        
        # Validate that resume has meaningful content
        if len(resume_text.strip()) < 100:
            candidate.status = CandidateStatus.ANALYZED
            candidate.concerns = ["Resume file appears to be empty or has insufficient content"]
            candidate.match_score = 0
            candidate.skill_match_percentage = 0
            candidates_db[candidate.id] = candidate
            continue
        
        # Extract basic info
        basic_info = resume_parser.extract_basic_info(resume_text)
        
        # AI Analysis
        screening_progress["step"] = "analyzing"
        jd_dict = {
            "title": request.job_description.title,
            "description": request.job_description.description,
            "required_skills": request.job_description.required_skills,
            "preferred_skills": request.job_description.preferred_skills,
            "min_experience_years": request.job_description.min_experience_years
        }
        
        analysis = await ai_analyzer.analyze_resume(resume_text, jd_dict)
        
        # Update candidate with analysis results
        screening_progress["step"] = "scoring"
        
        candidate.name = analysis.get("name") or basic_info.get("name") or "Unknown"
        candidate.summary = analysis.get("summary", "")
        candidate.contact = ContactInfo(
            email=analysis.get("contact", {}).get("email") or basic_info.get("email"),
            phone=analysis.get("contact", {}).get("phone") or basic_info.get("phone"),
            location=analysis.get("contact", {}).get("location"),
            linkedin=analysis.get("contact", {}).get("linkedin") or basic_info.get("linkedin"),
            github=analysis.get("contact", {}).get("github") or basic_info.get("github")
        )
        
        # Parse skills
        candidate.skills = [
            Skill(
                name=s.get("name", ""),
                proficiency=s.get("proficiency"),
                years=s.get("years")
            ) for s in analysis.get("skills", [])
        ]
        
        # Parse experience
        candidate.experience = [
            Experience(
                company=e.get("company", ""),
                title=e.get("title", ""),
                duration=e.get("duration", ""),
                description=e.get("description")
            ) for e in analysis.get("experience", [])
        ]
        
        # Parse education
        candidate.education = [
            Education(
                institution=e.get("institution", ""),
                degree=e.get("degree", ""),
                field=e.get("field"),
                year=e.get("year")
            ) for e in analysis.get("education", [])
        ]
        
        candidate.total_experience_years = analysis.get("total_experience_years", 0)
        candidate.strengths = analysis.get("strengths", [])
        candidate.concerns = analysis.get("concerns", [])
        candidate.matched_skills = analysis.get("matched_skills", [])
        candidate.missing_skills = analysis.get("missing_skills", [])
        candidate.improvement_suggestions = analysis.get("improvement_suggestions", [])
        candidate.recommendation_category = analysis.get("recommendation_category", "Considered")
        candidate.ai_recommendation = analysis.get("ai_recommendation", "")
        candidate.status = CandidateStatus.ANALYZED
        candidate.analyzed_at = datetime.now()
        
        # Assign to Job
        candidate.job_id = batch_job_id
        candidate.job_title = jobs_db[batch_job_id].title
        
        # Duplicate detection
        duplicate_id = duplicate_detector.find_duplicate(candidate, list(candidates_db.values()))
        if duplicate_id:
            candidate.duplicate_of = duplicate_id
        
        candidates_db[candidate.id] = candidate
        analyzed_candidates.append(candidate)
    
    # Rank candidates
    ranked_candidates = candidate_matcher.rank_candidates(analyzed_candidates, request.job_description)
    
    screening_progress = {"status": "complete", "progress": 100, "current_file": ""}
    
    return AnalysisResponse(
        message=f"Analyzed {len(ranked_candidates)} candidates",
        total_analyzed=len(ranked_candidates),
        candidates=ranked_candidates
    )


@router.get("/candidates")
async def get_candidates(
    status: Optional[str] = None, 
    min_score: Optional[float] = None,
    job_id: Optional[str] = None,
    limit: int = 100
):
    """Get list of candidates with optional filtering"""
    
    candidates = list(candidates_db.values())
    
    # Apply filters
    if status:
        candidates = [c for c in candidates if c.status == status]
    
    if min_score is not None:
        candidates = [c for c in candidates if c.match_score >= min_score]

    if job_id:
        candidates = [c for c in candidates if c.job_id == job_id]
        
    # Sort by match score
    candidates.sort(key=lambda x: x.match_score, reverse=True)
    
    return {"candidates": candidates[:limit], "total": len(candidates)}

@router.get("/jobs")
async def get_jobs():
    """Get list of all job postings"""
    # Update candidate counts and avg scores before returning
    for job_id, job in jobs_db.items():
        job_candidates = [c for c in candidates_db.values() if c.job_id == job_id]
        job.candidate_count = len(job_candidates)
        if job_candidates:
            job.avg_score = sum(c.match_score for c in job_candidates) / len(job_candidates)
        else:
            job.avg_score = 0.0
            
    return {"jobs": list(jobs_db.values())}

@router.get("/jobs/{job_id}/candidates")
async def get_job_candidates(job_id: str):
    """Get all candidates for a specific job title"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job_candidates = [c for c in candidates_db.values() if c.job_id == job_id]
    job_candidates.sort(key=lambda x: x.match_score, reverse=True)
    
    return {
        "job": jobs_db[job_id],
        "candidates": job_candidates
    }

@router.put("/jobs/{job_id}")
async def update_job(job_id: str, job_update: Dict):
    """Update job title or description"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs_db[job_id]
    if "title" in job_update:
        job.title = job_update["title"]
        # Also update candidates linked to this job
        for candidate in candidates_db.values():
            if candidate.job_id == job_id:
                candidate.job_title = job.title
                
    if "description" in job_update:
        job.description = job_update["description"]
        
    return {"message": "Job updated successfully", "job": job}

@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a job and its associated candidates or just un-link them"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Alternative: Remove candidates instead of un-linking
    # for cid in [c.id for c in candidates_db.values() if c.job_id == job_id]:
    #     del candidates_db[cid]
    
    # Un-link candidates from this job
    for candidate in candidates_db.values():
        if candidate.job_id == job_id:
            candidate.job_id = None
            candidate.job_title = None
            
    del jobs_db[job_id]
    return {"message": "Job deleted and candidates un-linked"}


@router.get("/candidates/{candidate_id}")
async def get_candidate(candidate_id: str):
    """Get detailed information about a specific candidate"""
    
    if candidate_id not in candidates_db:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    return candidates_db[candidate_id]


@router.post("/candidates/{candidate_id}/shortlist")
async def shortlist_candidate(candidate_id: str, background_tasks: BackgroundTasks):
    """Add a candidate to the shortlist"""
    
    if candidate_id not in candidates_db:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidates_db[candidate_id].status = CandidateStatus.SHORTLISTED
    
    # Send notification in background
    if background_tasks and candidates_db[candidate_id].contact and candidates_db[candidate_id].contact.email:
        job_title = current_job_description.title if current_job_description else "Position"
        background_tasks.add_task(
            email_service.notify_shortlisted,
            candidates_db[candidate_id].name,
            candidates_db[candidate_id].contact.email,
            job_title
        )
        
    return {"message": "Candidate shortlisted and notification sent", "candidate": candidates_db[candidate_id]}


@router.post("/candidates/{candidate_id}/reject")
async def reject_candidate(candidate_id: str, background_tasks: BackgroundTasks):
    """Reject a candidate"""
    
    if candidate_id not in candidates_db:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidates_db[candidate_id].status = CandidateStatus.REJECTED
    
    # Send notification in background
    if background_tasks and candidates_db[candidate_id].contact and candidates_db[candidate_id].contact.email:
        job_title = current_job_description.title if current_job_description else "Position"
        background_tasks.add_task(
            email_service.notify_rejected,
            candidates_db[candidate_id].name,
            candidates_db[candidate_id].contact.email,
            job_title
        )
        
    return {"message": "Candidate rejected and notification sent", "candidate": candidates_db[candidate_id]}


@router.get("/progress")
async def get_screening_progress():
    """Get current screening progress"""
    return screening_progress


@router.get("/job-description")
async def get_job_description():
    """Get the current job description"""
    return current_job_description


@router.post("/job-description")
async def set_job_description(job_description: JobDescription):
    """Set/update the job description"""
    global current_job_description
    current_job_description = job_description
    return {"message": "Job description saved", "job_description": job_description}


@router.delete("/candidates")
async def clear_candidates():
    """Clear all candidates (for testing)"""
    global candidates_db
    
    # Clean up files
    for candidate in candidates_db.values():
        for ext in ['.pdf', '.docx', '.doc']:
            file_path = os.path.join(settings.upload_folder, f"{candidate.id}{ext}")
            if os.path.exists(file_path):
                os.remove(file_path)
    
    candidates_db = {}
    return {"message": "All candidates cleared"}


@router.get("/stats")
async def get_stats():
    """Get screening statistics"""
    candidates = list(candidates_db.values())
    
    total = len(candidates)
    analyzed = len([c for c in candidates if c.status == CandidateStatus.ANALYZED])
    shortlisted = len([c for c in candidates if c.status == CandidateStatus.SHORTLISTED])
    rejected = len([c for c in candidates if c.status == CandidateStatus.REJECTED])
    pending = len([c for c in candidates if c.status == CandidateStatus.PENDING])
    
    avg_score: float = sum(c.match_score for c in candidates) / total if total > 0 else 0.0
    
    # Calculate skill demand
    skill_counts: Dict[str, int] = {}
    for c in candidates:
        for skill in c.skills:
            name = skill.name
            skill_counts[name] = skill_counts.get(name, 0) + 1
    
    top_skills_data = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)
    top_skills = [
        {"name": name, "count": count}
        for name, count in top_skills_data[:10]
    ]
    
    # Top candidates
    top_candidates_list = sorted(
        [c for c in candidates if c.match_score > 0],
        key=lambda x: x.match_score,
        reverse=True
    )
    top_candidates = top_candidates_list[:5]
    
    return {
        "total": total,
        "analyzed": analyzed,
        "shortlisted": shortlisted,
        "rejected": rejected,
        "pending": pending,
        "average_score": round(avg_score, 1),
        "top_skills": top_skills,
        "top_candidates": [
            {"name": c.name, "score": c.match_score} for c in top_candidates
        ]
    }
