import json
import logging
from typing import Optional, List, Dict, Any
import google.generativeai as genai
from ..config import get_settings
from ..models import Skill, Experience, Education, ContactInfo

logger = logging.getLogger(__name__)

class AIAnalyzer:
    """Service for AI-powered resume analysis using Google Gemini"""
    
    def __init__(self):
        self.settings = get_settings()
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the Gemini model"""
        try:
            if self.settings.gemini_api_key:
                genai.configure(api_key=self.settings.gemini_api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini AI model initialized successfully")
            else:
                logger.warning("No Gemini API key configured")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model: {str(e)}")
    
    async def analyze_resume(self, resume_text: str, job_description: Optional[Dict] = None) -> Dict[str, Any]:
        """Analyze a resume and extract structured information"""
        
        if not self.model:
            logger.error("AI model not initialized")
            return self._get_fallback_analysis(resume_text)
        
        prompt = self._build_analysis_prompt(resume_text, job_description)
        
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_ai_response(response.text)
            return result
        except Exception as e:
            logger.error(f"AI analysis failed: {str(e)}")
            return self._get_fallback_analysis(resume_text)
    
    def _build_analysis_prompt(self, resume_text: str, job_description: Optional[Dict] = None) -> str:
        """Build the prompt for resume analysis"""
        
        jd_context = ""
        if job_description:
            jd_context = f"""
JOB DESCRIPTION:
Title: {job_description.get('title', 'Not specified')}
Description: {job_description.get('description', 'Not specified')}
Required Skills: {', '.join(job_description.get('required_skills', []))}
Preferred Skills: {', '.join(job_description.get('preferred_skills', []))}
Minimum Experience: {job_description.get('min_experience_years', 'Not specified')} years
"""
        
        prompt = f"""Analyze the following resume and extract structured information. Return ONLY a valid JSON object with no additional text.

RESUME TEXT:
{resume_text[:8000]}  # Limit to avoid token limits

{jd_context}

Return a JSON object with this exact structure:
{{
    "name": "Full name of the candidate",
    "contact": {{
        "email": "email address or null",
        "phone": "phone number or null",
        "location": "city, state/country or null",
        "linkedin": "linkedin url or null",
        "github": "github url or null"
    }},
    "summary": "2-3 sentence professional summary",
    "skills": [
        {{"name": "skill name", "proficiency": "expert/intermediate/beginner or null", "years": years as number or null}}
    ],
    "experience": [
        {{
            "company": "company name",
            "title": "job title",
            "duration": "e.g., Jan 2020 - Present",
            "description": "brief description of role"
        }}
    ],
    "education": [
        {{
            "institution": "university/school name",
            "degree": "degree type",
            "field": "field of study or null",
            "year": "graduation year or null"
        }}
    ],
    "total_experience_years": total years of experience as number,
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "concerns": ["concern or area for improvement if any"],
    "match_score": score from 0-100 based on job fit (if job description provided, else 50),
    "skill_match_percentage": percentage of required skills matched (if job description provided, else 50),
    "ai_recommendation": "Brief recommendation about this candidate"
}}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, just the raw JSON."""

        return prompt
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the AI response and validate structure"""
        try:
            # Clean the response - remove any markdown code blocks if present
            cleaned = response_text.strip()
            if cleaned.startswith('```'):
                cleaned = cleaned.split('```')[1]
                if cleaned.startswith('json'):
                    cleaned = cleaned[4:]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
            
            result = json.loads(cleaned.strip())
            return self._validate_and_normalize(result)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {str(e)}")
            return self._get_fallback_analysis("")
    
    def _validate_and_normalize(self, data: Dict) -> Dict[str, Any]:
        """Validate and normalize the parsed data"""
        normalized = {
            "name": data.get("name", "Unknown"),
            "contact": data.get("contact", {}),
            "summary": data.get("summary", ""),
            "skills": data.get("skills", []),
            "experience": data.get("experience", []),
            "education": data.get("education", []),
            "total_experience_years": data.get("total_experience_years", 0),
            "strengths": data.get("strengths", []),
            "concerns": data.get("concerns", []),
            "match_score": min(100, max(0, data.get("match_score", 50))),
            "skill_match_percentage": min(100, max(0, data.get("skill_match_percentage", 50))),
            "ai_recommendation": data.get("ai_recommendation", "")
        }
        return normalized
    
    def _get_fallback_analysis(self, resume_text: str) -> Dict[str, Any]:
        """Return a fallback analysis when AI is unavailable"""
        return {
            "name": "Unknown",
            "contact": {},
            "summary": "AI analysis unavailable. Please configure Gemini API key.",
            "skills": [],
            "experience": [],
            "education": [],
            "total_experience_years": 0,
            "strengths": [],
            "concerns": ["AI analysis could not be performed"],
            "match_score": 0,
            "skill_match_percentage": 0,
            "ai_recommendation": "Manual review required"
        }
    
    async def compare_candidates(self, candidates: List[Dict], job_description: Dict) -> List[Dict]:
        """Compare multiple candidates and rank them"""
        if not self.model:
            return candidates
        
        # Simple ranking by match score
        sorted_candidates = sorted(
            candidates,
            key=lambda x: (x.get('match_score', 0), x.get('skill_match_percentage', 0)),
            reverse=True
        )
        
        for i, candidate in enumerate(sorted_candidates):
            candidate['rank'] = i + 1
        
        return sorted_candidates


# Singleton instance
ai_analyzer = AIAnalyzer()
