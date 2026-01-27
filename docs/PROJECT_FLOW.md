# Implementation Flow Chart

This document outlines the end-to-end execution flow of the AI Resume Screening application, from the user action to the final display of results.

## High-Level Process Flow

```mermaid
graph TD
    A[User Starts Application] --> B[Dashboard Interface];
    B --> C{Action?};
    
    C -- 1. Input JD --> D[JobDescriptionForm];
    D --> E[Save JD to Backend];
    
    C -- 2. Upload Resumes --> F[UploadZone];
    F --> G[POST /api/upload];
    G --> H[Backend Saves Files];
    H --> I[Return Upload Success];
    
    I --> J[User Clicks 'Analyze'];
    J --> K[POST /api/analyze];
    
    subgraph "Backend Processing Pipeline"
        K --> L[Iterate Candidates];
        L --> M[Service: Resume Parser];
        M --> N[Extract Raw Text];
        N --> O[Service: AI Analyzer (Gemini)];
        O --> P[Generate Prompt (Text + JD)];
        P --> Q[LLM Processing];
        Q --> R[Return Structured JSON];
        R --> S[Service: Matcher];
        S --> T[Calculate Match Score & Rank];
    end
    
    T --> U[Store Results];
    U --> V[Frontend Polling/Response];
    
    V --> W[Dashboard Updates];
    W --> X[Display Candidate Cards (Ranked)];
    
    X --> Y[User Views Details];
    Y --> Z[CandidateModal: Show Strengths/Weaknesses];
```

## Step-by-Step Description

1. **Initialization**:
    * The User launches the Web Client (React).
    * The User inputs the **Job Description (JD)** (Title, Required Skills, Experience). This sets the context for the AI.

2. **Data Ingestion**:
    * User drags and drops resumes (PDF/DOCX) into the **Upload Area**.
    * Frontend sends files to the Backend API.
    * Backend stores files securely in a temporary `uploads/` directory with unique IDs.

3. **Processing Trigger**:
    * User initiates the "Analyze" process.
    * The frontend displays a **Progress Bar** (e.g., "Analyzing 3 of 10...").

4. **The AI Pipeline**:
    * **Parsing**: The backend opens each file and extracts text using `resume_parser`.
    * **Reasoning**: The text + Job Description are sent to the **Gemini API**. The AI evaluates the candidate.
    * **Structuring**: The AI returns a structured JSON object containing: name, contact info, parsed skills, summary, strengths, and concerns.
    * **Scoring**: The `matcher` module calculates a 0-100% score based on skill overlap and experience requirements.

5. **Visualization**:
    * Results are sent back to the Frontend.
    * Candidates are displayed as "Cards," sorted from highest match score to lowest.
    * User can click any card to see deep insights (e.g., "Missing generic skill: Leadership").

6. **Decision**:
    * User marks candidates as **Shortlisted** or **Rejected**.
    * User exports the final list (optional future feature).
