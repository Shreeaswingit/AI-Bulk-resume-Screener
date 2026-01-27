"""
Direct test of AI analyzer with DOCX file
"""
import asyncio
import os
import sys
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.services.resume_parser import resume_parser
from app.services.ai_analyzer import ai_analyzer

async def test_ai_analysis():
    """Test AI analysis directly with DOCX"""
    
    print("=" * 80)
    print("DIRECT AI ANALYSIS TEST (DOCX)")
    print("=" * 80)
    
    # Check AI provider
    print(f"\nAI Provider: {ai_analyzer.provider}")
    print(f"Gemini Model initialized: {ai_analyzer.model is not None}")
    print(f"OpenRouter Client initialized: {ai_analyzer.client is not None}")
    
    # Parse a DOCX resume
    resume_path = r"d:\AI resume screenner\sample_resumes\JOHN.docx"
    
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
    
    try:
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
        
        if result.get('skills'):
            print(f"\nSkills extracted:")
            for skill in result.get('skills', [])[:10]:
                if isinstance(skill, dict):
                    print(f"  - {skill.get('name', 'Unknown')}")
                else:
                    print(f"  - {skill}")
        
        print("\n" + "=" * 80)
        print("DIAGNOSIS")
        print("=" * 80)
        
        has_name = result.get('name') != 'Unknown'
        has_skills = len(result.get('skills', [])) > 0
        has_experience = len(result.get('experience', [])) > 0
        has_score = result.get('match_score', 0) > 0
        
        if has_name and has_skills and has_experience and has_score:
            print("✅ AI is working correctly!")
        else:
            print("❌ AI Analysis Issues Detected:")
            if not has_name:
                print("   - Name not extracted")
            if not has_skills:
                print("   - No skills found")
            if not has_experience:
                print("   - No experience found")
            if not has_score:
                print("   - Score is 0")
                
    except Exception as e:
        print(f"\n❌ ERROR during AI analysis: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ai_analysis())
