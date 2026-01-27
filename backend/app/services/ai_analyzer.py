import json
import logging
from typing import Optional, List, Dict, Any
import asyncio
import time
import google.generativeai as genai
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None
from ..config import get_settings
from ..models import Skill, Experience, Education, ContactInfo

logger = logging.getLogger(__name__)

class AIAnalyzer:
    """Service for AI-powered resume analysis using Google Gemini"""
    
    def __init__(self):
        self.settings = get_settings()
        self.model = None
        self.client = None
        self.provider = None
        self.api_error = None  # Track API errors
        self.api_status = "unknown"  # Track API status
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the AI model (Gemini or OpenRouter)"""
        logger.info("Initializing AI Model...")
        if OpenAI:
            logger.info("OpenAI package imported successfully.")
        else:
            logger.error("OpenAI package import FAILED.")

        try:
            # Check for OpenRouter first
            logger.info(f"OpenRouter Key configured: {bool(self.settings.openrouter_api_key)}")
            if self.settings.openrouter_api_key:
                if OpenAI:
                    # Monkey patch for older openai versions if needed or just standard init
                    self.client = OpenAI(
                        base_url="https://openrouter.ai/api/v1",
                        api_key=self.settings.openrouter_api_key,
                    )
                    # Verify client creation
                    logger.info("OpenAI Client created pointing to OpenRouter.")
                    
                    self.provider = "openrouter"
                    logger.info(f"OpenRouter AI initialized with model: {self.settings.openrouter_model}")
                    return
                else:
                    logger.warning("OpenRouter key found but 'openai' package not installed.")

            # Fallback to Gemini
            logger.info(f"Gemini Key configured: {bool(self.settings.gemini_api_key)}")
            if self.settings.gemini_api_key:
                genai.configure(api_key=self.settings.gemini_api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                self.provider = "gemini"
                logger.info("Gemini AI model initialized successfully")
            else:
                logger.warning("No AI API key configured")
        except Exception as e:
            logger.error(f"Failed to initialize AI model: {str(e)}", exc_info=True)
    
    async def analyze_resume(self, resume_text: str, job_description: Optional[Dict] = None) -> Dict[str, Any]:
        """Analyze a resume and extract structured information"""
        
        if not self.model and not self.client:
            logger.error("AI model not initialized")
            self.api_error = "AI not configured. Please add GEMINI_API_KEY or OPENROUTER_API_KEY to backend/.env"
            self.api_status = "not_configured"
            return self._get_fallback_analysis(resume_text, include_error=True)
        
        prompt = self._build_analysis_prompt(resume_text, job_description)
        
        try:
            # Rate Limiting Logic: Delay before request
            if self.settings.rate_limit_enabled:
                delay = self.settings.rate_limit_delay
                logger.info(f"Rate limiting enabled. Waiting {delay} seconds before request...")
                await asyncio.sleep(delay)

            # Retry Logic for 429 Rate Limits
            max_retries = 3
            retry_count = 0
            
            while retry_count <= max_retries:
                try:
                    response_text = ""
                    if self.provider == "openrouter" and self.client:
                        completion = self.client.chat.completions.create(
                            model=self.settings.openrouter_model,
                            messages=[
                                {"role": "system", "content": "You are a helpful AI that extracts structured data from resumes."},
                                {"role": "user", "content": prompt}
                            ]
                        )
                        response_text = completion.choices[0].message.content
                    elif self.provider == "gemini" and self.model:
                        response = self.model.generate_content(prompt)
                        response_text = response.text
                    
                    self.api_error = None
                    self.api_status = "working"
                    return self._parse_ai_response(response_text)

                except Exception as inner_e:
                    error_str = str(inner_e)
                    if ("429" in error_str or "rate" in error_str.lower()) and retry_count < max_retries:
                        retry_count += 1
                        wait_time = self.settings.rate_limit_delay * (retry_count + 1)
                        logger.warning(f"Rate limit hit (429). Retrying in {wait_time}s (Attempt {retry_count}/{max_retries})...")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        raise inner_e # Re-raise to be caught by outer block for standard error handling

        except Exception as e:
            error_str = str(e)
            logger.error(f"AI analysis failed: {error_str}")
            
            # Detect specific error types
            if "401" in error_str or "authentication" in error_str.lower() or "unauthorized" in error_str.lower():
                self.api_error = "API Key Invalid: Authentication failed. Please check your API key in backend/.env"
                self.api_status = "auth_error"
            elif "429" in error_str or "rate" in error_str.lower():
                self.api_error = "Rate Limit: Too many requests. Please wait a moment and try again."
                self.api_status = "rate_limited"
            elif "timeout" in error_str.lower() or "connection" in error_str.lower():
                self.api_error = "Connection Error: Could not connect to AI service. Check your internet connection."
                self.api_status = "connection_error"
            else:
                self.api_error = f"AI Error: {error_str[:100]}"
                self.api_status = "error"
            
            return self._get_fallback_analysis(resume_text, include_error=True)
    
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

Return a JSON object with this exact structure. IMPORTANT: Extract the candidate's FULL NAME from the resume (usually at the top):
{{
    "name": "CANDIDATE'S FULL NAME - extract from resume, REQUIRED field",
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
            logger.info(f"Raw AI response (first 500 chars): {response_text[:500]}")
            
            if cleaned.startswith('```'):
                cleaned = cleaned.split('```')[1]
                if cleaned.startswith('json'):
                    cleaned = cleaned[4:]
            if cleaned.endswith('```'):
                cleaned = cleaned[:-3]
            
            result = json.loads(cleaned.strip())
            logger.info(f"Parsed AI result - name: {result.get('name', 'NOT FOUND')}")
            return self._validate_and_normalize(result)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {str(e)}")
            logger.error(f"Response text was: {response_text[:1000]}")
            return self._get_fallback_analysis("")
    
    def _validate_and_normalize(self, data: Dict) -> Dict[str, Any]:
        """Validate and normalize the parsed data"""
        
        # Only flag as truly empty if there's absolutely no content
        # AND the AI didn't provide explicit scores
        has_skills = len(data.get("skills", [])) > 0
        has_experience = len(data.get("experience", [])) > 0
        has_education = len(data.get("education", [])) > 0
        has_summary = len(data.get("summary", "").strip()) > 10
        
        # Check if AI provided actual scores (not using defaults)
        ai_provided_score = "match_score" in data and data.get("match_score") is not None
        
        # Only consider empty if NO content at all
        has_any_content = has_skills or has_experience or has_education or has_summary
        
        # Use AI's scores if provided, otherwise use smart defaults
        if ai_provided_score:
            # Trust the AI's analysis
            default_match_score = data.get("match_score", 50)
            default_skill_match = data.get("skill_match_percentage", 50)
        elif not has_any_content:
            # Truly empty resume
            default_match_score = 0
            default_skill_match = 0
        else:
            # Has content but AI didn't score - use neutral defaults
            default_match_score = 50
            default_skill_match = 50
        
        normalized = {
            "name": data.get("name", "Unknown"),
            "contact": data.get("contact", {}),
            "summary": data.get("summary", ""),
            "skills": data.get("skills", []),
            "experience": data.get("experience", []),
            "education": data.get("education", []),
            "total_experience_years": data.get("total_experience_years", 0),
            "strengths": data.get("strengths", []),
            "concerns": data.get("concerns", [] if has_any_content else ["No content found in resume"]),
            "match_score": min(100, max(0, data.get("match_score", default_match_score))),
            "skill_match_percentage": min(100, max(0, data.get("skill_match_percentage", default_skill_match))),
            "ai_recommendation": data.get("ai_recommendation", "" if has_any_content else "Resume appears to be empty")
        }
        return normalized
    
    def _get_fallback_analysis(self, resume_text: str, include_error: bool = False) -> Dict[str, Any]:
        """Return a fallback analysis when AI is unavailable"""
        error_msg = self.api_error if include_error and self.api_error else "AI analysis unavailable"
        
        return {
            "name": "Unknown",
            "contact": {},
            "summary": error_msg,
            "skills": [],
            "experience": [],
            "education": [],
            "total_experience_years": 0,
            "strengths": [],
            "concerns": [error_msg],
            "match_score": 0,
            "skill_match_percentage": 0,
            "ai_recommendation": error_msg,
            "api_error": self.api_error if include_error else None
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Return current API status"""
        return {
            "provider": self.provider,
            "status": self.api_status,
            "error": self.api_error,
            "gemini_configured": bool(self.settings.gemini_api_key),
            "openrouter_configured": bool(self.settings.openrouter_api_key)
        }
    
    async def compare_candidates(self, candidates: List[Dict], job_description: Dict) -> List[Dict]:
        """Compare multiple candidates and rank them"""
        if not self.model and not self.client:
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
