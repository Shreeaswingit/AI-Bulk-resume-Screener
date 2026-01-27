import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.services.resume_parser import resume_parser
from app.services.matcher import candidate_matcher
from app.services.ai_analyzer import ai_analyzer
from app.models import Candidate, JobDescription, Skill, Experience

async def test_multiple_resumes():
    """Test scoring with actual resume files"""
    
    resumes = [
        "sample_resumes/john_smith_senior_engineer.txt",
        "sample_resumes/michael_chen_junior.txt",
        "sample_resumes/sarah_johnson_fullstack.txt"
    ]
    
    job_desc = JobDescription(
        title="Data Engineer",
        description="Looking for experienced Data Engineer",
        required_skills=["Python", "SQL", "AWS"],
        preferred_skills=["Spark", "Kafka"],
        min_experience_years=3
    )
    
    print("=" * 80)
    print("TESTING MULTIPLE RESUMES FOR SCORE VARIATION")
    print("=" * 80)
    print(f"\nJob Description: {job_desc.title}")
    print(f"Required Skills: {', '.join(job_desc.required_skills)}")
    print(f"Preferred Skills: {', '.join(job_desc.preferred_skills)}")
    print(f"Min Experience: {job_desc.min_experience_years} years\n")
    
    results = []
    
    for resume_file in resumes:
        resume_path = os.path.join(os.path.dirname(__file__), resume_file)
        
        if not os.path.exists(resume_path):
            print(f"⚠️  File not found: {resume_path}")
            continue
        
        print("-" * 80)
        print(f"Processing: {os.path.basename(resume_file)}")
        print("-" * 80)
        
        # Parse resume
        text = resume_parser.parse_file(resume_path)
        if not text:
            print("❌ Failed to parse resume")
            continue
        
        print(f"✓ Parsed {len(text)} characters")
        
        # AI Analysis
        jd_dict = {
            "title": job_desc.title,
            "description": job_desc.description,
            "required_skills": job_desc.required_skills,
            "preferred_skills": job_desc.preferred_skills,
            "min_experience_years": job_desc.min_experience_years
        }
        
        analysis = await ai_analyzer.analyze_resume(text, jd_dict)
        
        print(f"✓ AI Analysis Complete")
        print(f"  - Name: {analysis.get('name', 'Unknown')}")
        print(f"  - Skills Found: {len(analysis.get('skills', []))}")
        print(f"  - Experience Years: {analysis.get('total_experience_years', 0)}")
        print(f"  - AI Match Score: {analysis.get('match_score', 0)}")
        
        # Create candidate
        candidate = Candidate(
            id=f"test-{len(results)}",
            name=analysis.get("name", "Unknown"),
            filename=os.path.basename(resume_file),
            skills=[
                Skill(
                    name=s.get("name", ""),
                    proficiency=s.get("proficiency"),
                    years=s.get("years")
                ) for s in analysis.get("skills", [])
            ],
            total_experience_years=analysis.get("total_experience_years", 0)
        )
        
        # Calculate match
        match_result = candidate_matcher.calculate_match(candidate, job_desc)
        
        print(f"✓ Matcher Score: {match_result['match_score']}")
        print(f"  - Skill Match %: {match_result['skill_match_percentage']}")
        print(f"  - Experience Fit: {match_result['experience_fit']}")
        print(f"  - Matched Skills: {len(match_result['matched_skills'])}")
        
        results.append({
            'file': os.path.basename(resume_file),
            'name': candidate.name,
            'ai_score': analysis.get('match_score', 0),
            'matcher_score': match_result['match_score'],
            'skill_match': match_result['skill_match_percentage'],
            'skills_count': len(candidate.skills),
            'experience_years': candidate.total_experience_years
        })
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY - SCORE COMPARISON")
    print("=" * 80)
    print(f"{'Resume':<40} {'AI Score':<12} {'Match Score':<12} {'Skills':<8} {'Exp':<8}")
    print("-" * 80)
    
    for r in results:
        print(f"{r['file']:<40} {r['ai_score']:<12} {r['matcher_score']:<12} {r['skills_count']:<8} {r['experience_years']:<8}")
    
    # Check if all scores are identical
    scores = [r['matcher_score'] for r in results]
    if len(set(scores)) == 1:
        print("\n⚠️  WARNING: All resumes have IDENTICAL scores!")
        print("   This indicates a problem with the scoring logic.")
    else:
        print(f"\n✓ GOOD: Scores vary from {min(scores)} to {max(scores)}")
    
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(test_multiple_resumes())
