from typing import List, Dict, Optional
from ..models import Candidate, JobDescription, Skill
import logging

logger = logging.getLogger(__name__)

class CandidateMatcher:
    """Service for matching candidates against job descriptions"""
    
    def __init__(self):
        self.skill_weight = 0.4
        self.experience_weight = 0.3
        self.education_weight = 0.15
        self.overall_fit_weight = 0.15
    
    def calculate_match(self, candidate: Candidate, job_description: JobDescription) -> Dict:
        """Calculate comprehensive match score for a candidate"""
        
        # Skill matching
        skill_score = self._calculate_skill_match(
            [s.name.lower() for s in candidate.skills],
            [s.lower() for s in job_description.required_skills],
            [s.lower() for s in job_description.preferred_skills]
        )
        
        # Experience matching
        exp_score = self._calculate_experience_match(
            candidate.total_experience_years or 0,
            job_description.min_experience_years or 0
        )
        
        # Calculate weighted score
        weighted_score = (
            skill_score['overall'] * self.skill_weight +
            exp_score * self.experience_weight +
            50 * self.education_weight +  # Default education score
            50 * self.overall_fit_weight    # Default fit score
        )
        
        # Mark matched skills
        matched_skills = self._get_matched_skills(
            candidate.skills,
            job_description.required_skills + job_description.preferred_skills
        )
        
        
        return {
            'match_score': min(100.0, round(weighted_score, 1)),
            'skill_match_percentage': round(skill_score['required_percentage'], 1),
            'matched_skills': matched_skills,
            'missing_required_skills': skill_score['missing_required'],
            'missing_preferred_skills': skill_score['missing_preferred'],
            'experience_fit': exp_score
        }
    
    def _calculate_skill_match(
        self,
        candidate_skills: List[str],
        required_skills: List[str],
        preferred_skills: List[str]
    ) -> Dict:
        """Calculate skill match percentage"""
        
        matched_required = []
        missing_required = []
        matched_preferred = []
        missing_preferred = []
        
        for skill in required_skills:
            if self._skill_matches(skill, candidate_skills):
                matched_required.append(skill)
            else:
                missing_required.append(skill)
        
        for skill in preferred_skills:
            if self._skill_matches(skill, candidate_skills):
                matched_preferred.append(skill)
            else:
                missing_preferred.append(skill)
        
        required_percentage = (
            len(matched_required) / len(required_skills) * 100
            if required_skills else 100
        )
        
        preferred_percentage = (
            len(matched_preferred) / len(preferred_skills) * 100
            if preferred_skills else 100
        )
        
        # Overall skill score (required has higher weight)
        overall = required_percentage * 0.7 + preferred_percentage * 0.3
        
        return {
            'required_percentage': required_percentage,
            'preferred_percentage': preferred_percentage,
            'overall': overall,
            'missing_required': missing_required,
            'missing_preferred': missing_preferred
        }
    
    def _skill_matches(self, skill: str, candidate_skills: List[str]) -> bool:
        """Check if a skill matches any candidate skill (with fuzzy matching)"""
        skill_lower = skill.lower()
        
        for cs in candidate_skills:
            # Exact match
            if skill_lower == cs:
                return True
            # Partial match (skill is contained in candidate skill or vice versa)
            if skill_lower in cs or cs in skill_lower:
                return True
            # Common variations
            if self._are_skill_variants(skill_lower, cs):
                return True
        
        return False
    
    def _are_skill_variants(self, skill1: str, skill2: str) -> bool:
        """Check if two skills are variants of each other"""
        variants = {
            'javascript': ['js', 'ecmascript'],
            'typescript': ['ts'],
            'python': ['py'],
            'react': ['reactjs', 'react.js'],
            'vue': ['vuejs', 'vue.js'],
            'angular': ['angularjs', 'angular.js'],
            'node': ['nodejs', 'node.js'],
            'postgresql': ['postgres', 'psql'],
            'mongodb': ['mongo'],
            'kubernetes': ['k8s'],
            'aws': ['amazon web services'],
            'gcp': ['google cloud', 'google cloud platform'],
            'azure': ['microsoft azure'],
        }
        
        for base, alts in variants.items():
            if (skill1 == base or skill1 in alts) and (skill2 == base or skill2 in alts):
                return True
        
        return False
    
    def _calculate_experience_match(
        self,
        candidate_years: float,
        required_years: float
    ) -> float:
        """Calculate experience match score"""
        if required_years == 0:
            return 100
        
        if candidate_years >= required_years:
            # Meet or exceed requirements = 100%
            return 100.0
        else:
            # Penalty for less experience
            return max(0, (candidate_years / required_years) * 100)
    
    def _get_matched_skills(
        self,
        candidate_skills: List[Skill],
        required_skills: List[str]
    ) -> List[Skill]:
        """Mark which skills are matched against requirements"""
        required_lower = [s.lower() for s in required_skills]
        
        matched = []
        for skill in candidate_skills:
            skill_copy = skill.model_copy()
            skill_copy.matched = self._skill_matches(skill.name.lower(), required_lower)
            matched.append(skill_copy)
        
        return matched
    
    def rank_candidates(
        self,
        candidates: List[Candidate],
        job_description: JobDescription
    ) -> List[Candidate]:
        """Rank candidates by their match scores"""
        
        scored_candidates = []
        for candidate in candidates:
            match_result = self.calculate_match(candidate, job_description)
            candidate.match_score = match_result['match_score']
            candidate.skill_match_percentage = match_result['skill_match_percentage']
            candidate.skills = match_result['matched_skills']
            scored_candidates.append(candidate)
        
        # Sort by match score descending
        scored_candidates.sort(key=lambda x: x.match_score, reverse=True)
        
        return scored_candidates


# Singleton instance
candidate_matcher = CandidateMatcher()
