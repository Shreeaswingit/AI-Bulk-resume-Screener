"""
Direct test of AI analyzer to see what it's actually returning
"""
import asyncio
import os
import sys
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.services.resume_parser import resume_parser
from app.services.ai_analyzer import ai_analyzer

async def test_ai_analysis():
    """Test AI analysis directly"""
    
    print("=" * 80)
    print("DIRECT AI ANALYSIS TEST")
    print("=" * 80)
    
    # Check AI provider
    print(f"\nAI Provider: {ai_analyzer.provider}")
    print(f"Model initialized: {ai_analyzer.model is not None}")
    print(f"Client initialized: {ai_analyzer.client is not None}")
    
    # Parse a real resume
    resume_path = r"d:\AI resume screenner\sample_resumes\john_smith_senior_engineer.txt"
    
    print(f"\nParsing: {resume_path}")
    text = resume_parser.parse_file(resume_path)
    
    if not text:
        print("❌ Failed to parse resume!")
        return
    
    print(f"✓ Parsed {len(text)} characters")
    print(f"\nFirst 500 chars of resume:\n{text[:500]}")
    
    # Call AI analyzer
    print("\n" + "-" * 80)
    print("Calling AI Analyzer...")
    print("-" * 80)
    
    job_desc = {
        "title": "Data Engineer",
        "description": "Looking for experienced Data Engineer",
        "required_skills": ["Python", "SQL", "AWS"],
        "preferred_skills": ["Spark", "Kafka"],
        "min_experience_years": 3
    }
    
    result = await ai_analyzer.analyze_resume(text, job_desc)
    
    print("\n" + "=" * 80)
    print("AI ANALYSIS RESULT")
    print("=" * 80)
    
    print(f"\nName: {result.get('name', 'NOT FOUND')}")
    print(f"Summary: {result.get('summary', 'NOT FOUND')[:100] if result.get('summary') else 'NOT FOUND'}...")
    print(f"Skills: {len(result.get('skills', []))} found")
    print(f"Experience: {len(result.get('experience', []))} entries")
    print(f"Education: {len(result.get('education', []))} entries")
    print(f"Total Experience Years: {result.get('total_experience_years', 0)}")
    print(f"Match Score: {result.get('match_score', 'NOT FOUND')}")
    print(f"Skill Match %: {result.get('skill_match_percentage', 'NOT FOUND')}")
    print(f"AI Recommendation: {result.get('ai_recommendation', 'NOT FOUND')[:100] if result.get('ai_recommendation') else 'NOT FOUND'}...")
    
    if result.get('skills'):
        print(f"\nSkills extracted:")
        for skill in result.get('skills', [])[:5]:
            print(f"  - {skill.get('name', 'Unknown')}")
    
    print("\n" + "=" * 80)
    print("FULL RESULT JSON")
    print("=" * 80)
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(test_ai_analysis())
