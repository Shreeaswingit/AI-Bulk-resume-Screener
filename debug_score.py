import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.services.resume_parser import resume_parser
from app.services.matcher import candidate_matcher
from app.models import Candidate, JobDescription, Skill

async def main():
    resume_path = r"d:\AI resume screenner\sample_resumes\shree dummy resume.docx"
    print(f"Processing: {resume_path}")
    
    # 1. Parse
    text = resume_parser.parse_file(resume_path)
    print(f"Parsed Text Length: {len(text) if text else 0}")
    print(f"Preview: {text[:200] if text else 'None'}")
    
    if not text:
        print("Failed to parse file.")
        return

    # 2. Mock AI Extraction (Assume it fails or finds nothing useful for a dummy)
    # If the text is truly dummy, AI might return empty skills.
    # Let's see what the text actually is first.
    
    # 3. Calculate Score with Empty Skills/Experience to verify "15" hypothesis
    candidate = Candidate(
        id="test",
        name="Test Candidate",
        filename="shree dummy resume.docx",
        skills=[],
        total_experience_years=0
    )
    
    job_desc = JobDescription(
        title="Data Engineer",
        description="Data Engineer role",
        required_skills=["Python", "SQL", "AWS"],
        preferred_skills=["Spark", "Kafka"],
        min_experience_years=3
    )
    
    match_result = candidate_matcher.calculate_match(candidate, job_desc)
    print("\n--- Match Result with Empty Skills/Exp ---")
    print(f"Score: {match_result['match_score']}")
    print(f"Details: {match_result}")

if __name__ == "__main__":
    asyncio.run(main())
