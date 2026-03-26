from typing import List, Optional, Dict
from ..models import Candidate
import logging

logger = logging.getLogger(__name__)

class DuplicateDetector:
    """Service for detecting duplicate resumes"""
    
    def find_duplicate(self, new_candidate: Candidate, existing_candidates: List[Candidate]) -> Optional[str]:
        """
        Check if a candidate already exists based on email or phone.
        Returns the ID of the duplicate candidate if found.
        """
        if not new_candidate.contact:
            return None
            
        new_email = new_candidate.contact.email.lower() if new_candidate.contact.email else None
        new_phone = "".join(filter(str.isdigit, new_candidate.contact.phone)) if new_candidate.contact.phone else None
        
        for existing in existing_candidates:
            if existing.id == new_candidate.id:
                continue
                
            if not existing.contact:
                continue
                
            # Check email
            if new_email and existing.contact.email and new_email == existing.contact.email.lower():
                logger.info(f"Duplicate found by email: {new_email}")
                return existing.id
                
            # Check phone
            if new_phone and existing.contact.phone:
                existing_phone = "".join(filter(str.isdigit, existing.contact.phone))
                if new_phone == existing_phone:
                    logger.info(f"Duplicate found by phone: {new_phone}")
                    return existing.id
                    
        return None

duplicate_detector = DuplicateDetector()
