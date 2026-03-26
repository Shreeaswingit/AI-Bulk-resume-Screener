import logging
import asyncio
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from ..config import get_settings

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending email notifications to candidates using Gmail SMTP"""
    
    def __init__(self):
        self.settings = get_settings()

    async def send_email(self, recipient: str, subject: str, body: str):
        """Send email via Gmail SMTP"""
        if not self.settings.smtp_user or not self.settings.smtp_password:
            logger.warning("SMTP credentials not configured. Skipping email.")
            # Fallback to logging for development
            logger.info(f"MOCK EMAIL to {recipient}: {subject}")
            return False

        try:
            # Create message
            message = MIMEMultipart()
            message["From"] = self.settings.smtp_from or self.settings.smtp_user
            message["To"] = recipient
            message["Subject"] = subject
            message.attach(MIMEText(body, "plain"))

            # Create secure SSL context
            context = ssl.create_default_context()

            # Run SMTP in a thread pool to avoid blocking the event loop
            def _send():
                with smtplib.SMTP_SSL(
                    self.settings.smtp_host, 
                    self.settings.smtp_port, 
                    context=context
                ) as server:
                    server.login(self.settings.smtp_user, self.settings.smtp_password)
                    server.send_message(message)
            
            await asyncio.to_thread(_send)
            logger.info(f"Successfully sent email to {recipient}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipient}: {str(e)}")
            return False

    async def notify_shortlisted(self, candidate_name: str, email: str, job_title: str):
        subject = f"Good News! Your application for {job_title}"
        body = f"Hi {candidate_name},\n\nWe are pleased to inform you that you have been shortlisted for the {job_title} position. We will contact you soon for the next steps.\n\nBest regards,\nRecruitment Team"
        return await self.send_email(email, subject, body)

    async def notify_rejected(self, candidate_name: str, email: str, job_title: str):
        subject = f"Update regarding your application for {job_title}"
        body = f"Hi {candidate_name},\n\nThank you for your interest in the {job_title} position. After careful consideration, we have decided to move forward with other candidates at this time.\n\nBest regards,\nRecruitment Team"
        return await self.send_email(email, subject, body)

    async def send_interview_invite(self, candidate_name: str, email: str, job_title: str, date: str, time: str):
        subject = f"Interview Invitation: {job_title}"
        body = f"Hi {candidate_name},\n\nWe would like to invite you for an interview for the {job_title} position on {date} at {time}.\n\nPlease confirm your availability.\n\nBest regards,\nRecruitment Team"
        return await self.send_email(email, subject, body)

email_service = EmailService()
