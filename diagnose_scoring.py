"""
Simple diagnostic to check why all resumes get same score
"""
import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.services.resume_parser import resume_parser
from app.services.matcher import candidate_matcher
from app.models import Candidate, JobDescription, Skill

def test_scoring_logic():
    """Test if matcher produces different scores for different inputs"""
    
    print("=" * 80)
    print("DIAGNOSTIC: Testing Matcher Logic")
    print("=" * 80)
    
    job_desc = JobDescription(
        title="Data Engineer",
        description="Data Engineer role",
        required_skills=["Python", "SQL", "AWS"],
        preferred_skills=["Spark", "Kafka"],
        min_experience_years=3
    )
    
    # Test Case 1: No skills, no experience
    candidate1 = Candidate(
        id="test1",
        name="Empty Candidate",
        filename="empty.txt",
        skills=[],
        total_experience_years=0
    )
    
    # Test Case 2: Some skills, less experience
    candidate2 = Candidate(
        id="test2",
        name="Junior Candidate",
        filename="junior.txt",
        skills=[
            Skill(name="Python", proficiency="intermediate", years=1)
        ],
        total_experience_years=1
    )
    
    # Test Case 3: All skills, good experience
    candidate3 = Candidate(
        id="test3",
        name="Senior Candidate",
        filename="senior.txt",
        skills=[
            Skill(name="Python", proficiency="expert", years=5),
            Skill(name="SQL", proficiency="expert", years=4),
            Skill(name="AWS", proficiency="intermediate", years=3),
            Skill(name="Spark", proficiency="intermediate", years=2)
        ],
        total_experience_years=7
    )
    
    candidates = [candidate1, candidate2, candidate3]
    results = []
    
    for candidate in candidates:
        match = candidate_matcher.calculate_match(candidate, job_desc)
        results.append({
            'name': candidate.name,
            'skills': len(candidate.skills),
            'experience': candidate.total_experience_years,
            'score': match['match_score'],
            'skill_match': match['skill_match_percentage']
        })
        
        print(f"\n{candidate.name}:")
        print(f"  Skills: {len(candidate.skills)}")
        print(f"  Experience: {candidate.total_experience_years} years")
        print(f"  Match Score: {match['match_score']}")
        print(f"  Skill Match: {match['skill_match_percentage']}%")
    
    print("\n" + "=" * 80)
    print("ANALYSIS")
    print("=" * 80)
    
    scores = [r['score'] for r in results]
    
    if len(set(scores)) == 1:
        print("❌ PROBLEM: All scores are IDENTICAL!")
        print(f"   All candidates scored: {scores[0]}")
        print("   This suggests the matcher is not differentiating between candidates.")
    elif len(set(scores)) == len(scores):
        print("✓ GOOD: All scores are DIFFERENT")
        print(f"   Score range: {min(scores)} to {max(scores)}")
    else:
        print("⚠️  PARTIAL: Some scores are the same")
        print(f"   Unique scores: {set(scores)}")
    
    return len(set(scores)) > 1

if __name__ == "__main__":
    success = test_scoring_logic()
    sys.exit(0 if success else 1)
