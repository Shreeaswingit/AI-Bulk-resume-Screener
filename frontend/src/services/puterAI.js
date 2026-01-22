/**
 * Puter.js AI Service - Free AI API
 * Uses Puter.js for free AI analysis without needing API keys
 */

// Check if Puter is loaded
const isPuterLoaded = () => typeof window.puter !== 'undefined';

// Wait for Puter to load
const waitForPuter = () => {
    return new Promise((resolve, reject) => {
        if (isPuterLoaded()) {
            resolve(window.puter);
            return;
        }

        let attempts = 0;
        const maxAttempts = 50;
        const interval = setInterval(() => {
            attempts++;
            if (isPuterLoaded()) {
                clearInterval(interval);
                resolve(window.puter);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                reject(new Error('Puter.js failed to load'));
            }
        }, 100);
    });
};

// Analyze resume using Puter AI (FREE)
export async function analyzeResumeWithPuter(resumeText, jobDescription) {
    const puter = await waitForPuter();

    const prompt = `Analyze the following resume against the job description and extract structured information.

JOB DESCRIPTION:
Title: ${jobDescription.title}
Description: ${jobDescription.description}
Required Skills: ${jobDescription.required_skills?.join(', ') || 'Not specified'}
Preferred Skills: ${jobDescription.preferred_skills?.join(', ') || 'Not specified'}
Minimum Experience: ${jobDescription.min_experience_years || 'Not specified'} years

RESUME TEXT:
${resumeText.slice(0, 6000)}

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "name": "Full name of the candidate",
  "contact": {
    "email": "email or null",
    "phone": "phone or null",
    "location": "location or null"
  },
  "summary": "2-3 sentence professional summary",
  "skills": [
    {"name": "skill name", "proficiency": "expert/intermediate/beginner", "years": null, "matched": true/false}
  ],
  "experience": [
    {"company": "company", "title": "job title", "duration": "duration", "description": "brief description"}
  ],
  "education": [
    {"institution": "school", "degree": "degree", "field": "field", "year": "year"}
  ],
  "total_experience_years": number,
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1"],
  "match_score": 0-100,
  "skill_match_percentage": 0-100,
  "ai_recommendation": "Brief recommendation"
}`;

    try {
        const response = await puter.ai.chat(prompt, {
            model: 'claude-sonnet-4',  // Free via Puter!
        });

        // Parse the response
        let responseText = response.toString();

        // Clean up markdown if present
        if (responseText.includes('```json')) {
            responseText = responseText.split('```json')[1].split('```')[0];
        } else if (responseText.includes('```')) {
            responseText = responseText.split('```')[1].split('```')[0];
        }

        const result = JSON.parse(responseText.trim());
        return result;
    } catch (error) {
        console.error('Puter AI analysis failed:', error);
        throw error;
    }
}

// Chat with AI about candidates
export async function chatWithPuter(message, context = '') {
    const puter = await waitForPuter();

    const prompt = context
        ? `${context}\n\nUser question: ${message}`
        : message;

    const response = await puter.ai.chat(prompt, {
        model: 'claude-sonnet-4',
    });

    return response.toString();
}

// Extract text from file using Puter AI vision (for images/scanned PDFs)
export async function extractTextWithVision(imageUrl) {
    const puter = await waitForPuter();

    const response = await puter.ai.chat(
        'Extract all text from this resume image. Return only the text content.',
        imageUrl,
        { model: 'gpt-5-nano' }
    );

    return response.toString();
}
