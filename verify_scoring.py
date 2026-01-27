import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Force reload of modules
import importlib
if 'app.services.matcher' in sys.modules:
    del sys.modules['app.services.matcher']
if 'app.models' in sys.modules:
    del sys.modules['app.models']

from app.services.matcher import CandidateMatcher
from app.models import Candidate, JobDescription, Skill

def test_empty_resume():
    """Test that empty resume gets score of 0"""
    print("=" * 60)
    print("TEST 1: Empty Resume (No Skills, No Experience)")
    print("=" * 60)
    
    matcher = CandidateMatcher()
    
    candidate = Candidate(
        id="test-empty",
        name="Empty Candidate",
        filename="empty.docx",
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
    
    match_result = matcher.calculate_match(candidate, job_desc)
    print(f"Match Score: {match_result['match_score']}")
    print(f"Skill Match %: {match_result['skill_match_percentage']}")
    print(f"Expected: 0.0")
    print(f"PASS: {match_result['match_score'] == 0.0}" if match_result['match_score'] == 0.0 else f"FAIL: Got {match_result['match_score']}")
    print()
    return match_result['match_score'] == 0.0

def test_partial_match():
    """Test that resume with some skills gets appropriate score"""
    print("=" * 60)
    print("TEST 2: Partial Match (Some Skills, Some Experience)")
    print("=" * 60)
    
    matcher = CandidateMatcher()
    
    candidate = Candidate(
        id="test-partial",
        name="Partial Candidate",
        filename="partial.docx",
        skills=[
            Skill(name="Python", proficiency="expert", years=3),
            Skill(name="JavaScript", proficiency="intermediate", years=2)
        ],
        total_experience_years=2
    )
    
    job_desc = JobDescription(
        title="Data Engineer",
        description="Data Engineer role",
        required_skills=["Python", "SQL", "AWS"],
        preferred_skills=["Spark", "Kafka"],
        min_experience_years=3
    )
    
    match_result = matcher.calculate_match(candidate, job_desc)
    print(f"Match Score: {match_result['match_score']}")
    print(f"Skill Match %: {match_result['skill_match_percentage']}")
    print(f"Expected: > 0 (should have some score)")
    print(f"PASS: {match_result['match_score'] > 0}" if match_result['match_score'] > 0 else f"FAIL: Got {match_result['match_score']}")
    print()
    return match_result['match_score'] > 0

def test_full_match():
    """Test that resume with all skills gets high score"""
    print("=" * 60)
    print("TEST 3: Full Match (All Skills, Good Experience)")
    print("=" * 60)
    
    matcher = CandidateMatcher()
    
    candidate = Candidate(
        id="test-full",
        name="Full Match Candidate",
        filename="full.docx",
        skills=[
            Skill(name="Python", proficiency="expert", years=5),
            Skill(name="SQL", proficiency="expert", years=4),
            Skill(name="AWS", proficiency="intermediate", years=3),
            Skill(name="Spark", proficiency="intermediate", years=2),
            Skill(name="Kafka", proficiency="beginner", years=1)
        ],
        total_experience_years=5
    )
    
    job_desc = JobDescription(
        title="Data Engineer",
        description="Data Engineer role",
        required_skills=["Python", "SQL", "AWS"],
        preferred_skills=["Spark", "Kafka"],
        min_experience_years=3
    )
    
    match_result = matcher.calculate_match(candidate, job_desc)
    print(f"Match Score: {match_result['match_score']}")
    print(f"Skill Match %: {match_result['skill_match_percentage']}")
    print(f"Expected: > 80 (should have high score)")
    print(f"PASS: {match_result['match_score'] > 80}" if match_result['match_score'] > 80 else f"FAIL: Got {match_result['match_score']}")
    print()
    return match_result['match_score'] > 80

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("RESUME SCORING VALIDATION TESTS")
    print("=" * 60 + "\n")
    
    test1_pass = test_empty_resume()
    test2_pass = test_partial_match()
    test3_pass = test_full_match()
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Test 1 (Empty Resume = 0): {'✓ PASS' if test1_pass else '✗ FAIL'}")
    print(f"Test 2 (Partial Match > 0): {'✓ PASS' if test2_pass else '✗ FAIL'}")
    print(f"Test 3 (Full Match > 80): {'✓ PASS' if test3_pass else '✗ FAIL'}")
    print(f"\nOverall: {'✓ ALL TESTS PASSED' if all([test1_pass, test2_pass, test3_pass]) else '✗ SOME TESTS FAILED'}")
    print("=" * 60)
