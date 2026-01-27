# AI Resume Screening & Candidate Evaluation System

## Project Documentation

---

# 1. Abstract

### Overview

In the modern recruitment landscape, Human Resources (HR) departments are often overwhelmed by the sheer volume of resumes received for job openings. Manual screening is time-consuming, prone to human bias, and inefficient, often leading to potential mismatches or overlooked talent.

The **AI Resume Screening & Candidate Evaluation System** is a cutting-edge web application designed to automate and enhance the initial phase of the recruitment process. By leveraging large language models (Google Gemini AI), the system parses, analyzes, and scores resumes against specific job descriptions in real-time.

### Functionality

The application allows recruiters to bulk upload candidate resumes in various formats (PDF, DOCX). Unlike traditional keyword scanners, the system performs a semantic analysis of the candidate's experience, skills, and education. It compares these attributes directly against the provided Job Description (JD) to calculate a "Match Score."

### Key Outcome

The system provides a ranked list of candidates with detailed insights, including strengths, missing critical skills, and an AI-generated recommendation summary. This empowers hiring managers to make data-driven decisions faster, significantly identifying top talent while reducing the "time-to-hire" metric.

---

# 2. System Modules Design

The application works on a Client-Server architecture, divided efficiently into a Frontend User Interface and a Backend Processing Unit.

## Frontend Modules (Client-Side)

 built with **React.js (Vite)**, the frontend focuses on user experience and real-time feedback.

### Core Components

| Component Name | Description |
| :--- | :--- |
| **UploadZone** | Handles file drag-and-drop functionality, validates file types (PDF/DOCX), and manages the initial API upload requests. |
| **JobDescriptionForm** | Allows recruiters to input or paste Job Descriptions (JD). This acts as the "ground truth" for the AI analysis. |
| **CandidateCard** | Displays a summary of each candidate, including their photo (placeholder), key skills, and the AI-calculated Match Score. |
| **CandidateModal** | A detailed view that opens when a card is clicked. It shows the full AI analysis: Contact Info, Education, Experience, Strengths, and Concerns. |
| **ScreeningProgress** | Specific UI component that polls the backend to show the real-time status of resume parsing and analysis (e.g., "Parsing file 1 of 5..."). |
| **StatsCards** | Dashboard widgets displaying high-level metrics: Total Candidates, Analyzed, Shortlisted, Rejected. |
| **Sidebar** | Navigation module providing access to different views like "Dashboard," "All Candidates," and "Settings." |

## Backend Modules (Server-Side)

Built with **FastAPI (Python)**, the backend handles the heavy lifting of file processing and AI integration.

### API Routes (`/app/routes`)

- **`screening.py`**: The primary controller.
  - `POST /upload`: Receives and saves resume files.
  - `POST /analyze`: Triggers the AI pipeline.
  - `GET /candidates`: Retrieves processed results.
  - `GET /stats`: Computes dashboard metrics.

### Service Modules (`/app/services`)

 These contain the core business logic:

1. **`resume_parser.py`** (Text Extraction)
    - Uses `PyPDF2`/`pdfplumber` (PDF) and `python-docx` (Word) to extract raw text content from files.
    - Cleans and sanitizes text for the AI.

2. **`ai_analyzer.py`** (The Brain / AI Inference)
    - Constructs prompt engineering templates sent to **Google Gemini AI**.
    - Asks the LLM to extract structured JSON data (Name, Skills, Experience) and interpret the candidate's fit for the specific JD.

3. **`matcher.py`** (Scoring Algorithm)
    - Performs deterministic calculations or weighs specific criteria (like "Years of Experience" vs "Required Skills") to generate a final ranked `match_score` (0-100%).

---

# 3. Implementation Flow Chart

This section outlines the end-to-end execution flow of the AI Resume Screening application.

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
    - User inputs the **Job Description (JD)** (Title, Skills, Experience).

2. **Data Ingestion**:
    - User uploads resumes (PDF/DOCX) via the **Upload Area**.
    - Files are stored securely in a temporary `uploads/` directory.

3. **Processing Trigger**:
    - User initiates "Analyze". Frontend displays a progress bar.

4. **The AI Pipeline**:
    - **Parsing**: Extract text using `resume_parser`.
    - **Reasoning**: Send Text + JD to **Gemini API**.
    - **Structuring**: AI returns structured JSON (Contact info, skills, strengths).
    - **Scoring**: `matcher` calculates a 0-100% fit score.

5. **Visualization & Decision**:
    - Results displayed as ranked "Cards" on the dashboard.
    - User views details, and marks candidates as **Shortlisted** or **Rejected**.

---

# 4. Hardware and Software Requirements

## Hardware Requirements

### Server (For Deployment/Hosting)

* **Processor**: Dual Core 2.0 GHz or higher.
- **RAM**: 4 GB (Min), 8 GB (Recommended).
- **Storage**: 512 MB for code + temporary space for uploads.
- **Network**: Active Internet connection (Mandatory for Google Gemini API).

### Client (User's Machine)

* **Device**: Desktop/Laptop.
- **Browser**: Modern browser (Chrome, Edge, Firefox, Safari).

## Software Requirements

### Development Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Backend** | **Python 3.9+** | FastAPI, Uvicorn, Pydantic |
| **Frontend** | **Node.js 18+** | React.js, Vite, Axios |
| **Libraries** | **Python** | `google-generativeai`, `pypdf`, `python-docx` |
| **External** | **API** | Google Gemini API Key |

### System Environment

* **OS**: Windows 10/11, macOS, or Linux (Ubuntu).
