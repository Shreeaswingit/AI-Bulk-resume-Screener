# AI Resume Screener - Process Flow & Architecture Analysis

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Process Flows](#process-flows)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Component Interactions](#component-interactions)

---

## System Overview

The AI Resume Screener is a full-stack application that automates the resume screening process using AI. It supports two AI modes:

1. **Backend Gemini API** - Server-side AI analysis using Google's Gemini Pro
2. **Puter.js Free AI** - Client-side AI analysis using Claude Sonnet 4 (no API key required)

### Technology Stack

**Frontend:**

- React 18 with Vite
- Vanilla CSS with CSS Variables
- File handling with FileReader API
- Puter.js SDK for free AI

**Backend:**

- FastAPI (Python)
- Google Gemini AI (gemini-pro)
- PyPDF2 & pdfplumber for PDF parsing
- python-docx for DOCX parsing
- In-memory storage (candidates_db)

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend - React Application"
        UI[User Interface]
        Upload[UploadZone Component]
        JD[JobDescription Form]
        CandList[Candidate List]
        Modal[Candidate Modal]
        
        subgraph "Services Layer"
            API[API Service]
            PuterAI[Puter.js AI Service]
        end
        
        subgraph "State Management"
            State[React State]
            Files[File Contents]
            Candidates[Candidates Array]
        end
    end
    
    subgraph "Backend - FastAPI Server"
        Router[API Router]
        
        subgraph "Services"
            Parser[Resume Parser]
            AIAnalyzer[AI Analyzer]
            Matcher[Candidate Matcher]
        end
        
        subgraph "Storage"
            Memory[(In-Memory DB)]
            FileSystem[File System]
        end
        
        subgraph "External APIs"
            Gemini[Google Gemini API]
        end
    end
    
    subgraph "External Services"
        PuterCloud[Puter.js Cloud AI]
    end
    
    UI --> Upload
    UI --> JD
    UI --> CandList
    CandList --> Modal
    
    Upload --> API
    JD --> API
    JD --> PuterAI
    
    API --> Router
    PuterAI --> PuterCloud
    
    Router --> Parser
    Router --> AIAnalyzer
    Router --> Matcher
    
    Parser --> FileSystem
    AIAnalyzer --> Gemini
    Matcher --> Memory
    
    Router --> Memory
    Router --> FileSystem
    
    State --> Files
    State --> Candidates
```

---

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TD
    App[App.jsx - Root Component]
    
    App --> Sidebar[Sidebar]
    App --> UploadZone[UploadZone]
    App --> JobForm[JobDescriptionForm]
    App --> Stats[StatsCards]
    App --> CandCards[CandidateCard x N]
    App --> Modal[CandidateModal]
    App --> Progress[ScreeningProgress]
    
    App --> APIService[api.js]
    App --> PuterService[puterAI.js]
    
    style App fill:#6366f1
    style APIService fill:#10b981
    style PuterService fill:#10b981
```

### State Management

The application uses React's `useState` hook for state management:

| State Variable | Purpose |
|----------------|---------|
| `activeSection` | Current view (dashboard, upload, candidates, shortlisted, settings) |
| `isDarkMode` | Theme toggle |
| `candidates` | Array of all candidate objects |
| `stats` | Statistics (total, analyzed, shortlisted, rejected, avg_score) |
| `progress` | Real-time analysis progress tracking |
| `uploadedFiles` | Files uploaded but not yet analyzed |
| `fileContents` | Raw file objects for Puter.js analysis |
| `usePuterAI` | Toggle between Puter.js and Backend AI |

### Key Frontend Components

#### 1. **UploadZone.jsx**

- Drag-and-drop file upload
- File validation (.pdf, .docx, .doc)
- Multiple file selection
- Visual feedback during upload

#### 2. **JobDescriptionForm.jsx**

- Job title and description input
- Required/preferred skills management
- Minimum experience specification
- Dual submit buttons (Backend vs Puter AI)

#### 3. **CandidateCard.jsx**

- Display candidate summary
- Match score visualization
- Quick actions (View, Shortlist, Reject)
- Status badges

#### 4. **CandidateModal.jsx**

- Detailed candidate view
- Skills breakdown
- Experience timeline
- Education history
- AI recommendations

---

## Backend Architecture

### API Routes Structure

```mermaid
graph LR
    subgraph "API Endpoints - /api"
        Upload[POST /upload]
        Analyze[POST /analyze]
        GetCands[GET /candidates]
        GetCand[GET /candidates/:id]
        Shortlist[POST /candidates/:id/shortlist]
        Reject[POST /candidates/:id/reject]
        Progress[GET /progress]
        Stats[GET /stats]
        JD[GET/POST /job-description]
        Clear[DELETE /candidates]
    end
    
    Upload --> UploadHandler[Upload Handler]
    Analyze --> AnalyzeHandler[Analyze Handler]
    GetCands --> CandHandler[Candidate Handler]
    
    style Upload fill:#10b981
    style Analyze fill:#f59e0b
    style GetCands fill:#3b82f6
```

### Service Layer Architecture

```mermaid
graph TB
    subgraph "Resume Parser Service"
        ParseFile[parse_file]
        ParsePDF[_parse_pdf]
        ParseDOCX[_parse_docx]
        ExtractInfo[extract_basic_info]
        
        ParseFile --> ParsePDF
        ParseFile --> ParseDOCX
        ParseFile --> ExtractInfo
    end
    
    subgraph "AI Analyzer Service"
        AnalyzeResume[analyze_resume]
        BuildPrompt[_build_analysis_prompt]
        ParseResponse[_parse_ai_response]
        Validate[_validate_and_normalize]
        
        AnalyzeResume --> BuildPrompt
        AnalyzeResume --> ParseResponse
        ParseResponse --> Validate
    end
    
    subgraph "Candidate Matcher Service"
        CalcMatch[calculate_match]
        RankCands[rank_candidates]
    end
```

### Data Models (Pydantic Schemas)

```mermaid
classDiagram
    class Candidate {
        +str id
        +str name
        +str filename
        +CandidateStatus status
        +ContactInfo contact
        +str summary
        +List~Skill~ skills
        +List~Experience~ experience
        +List~Education~ education
        +float total_experience_years
        +float match_score
        +float skill_match_percentage
        +List~str~ strengths
        +List~str~ concerns
        +str ai_recommendation
        +datetime created_at
        +datetime analyzed_at
    }
    
    class ContactInfo {
        +str email
        +str phone
        +str location
        +str linkedin
        +str github
    }
    
    class Skill {
        +str name
        +str proficiency
        +float years
        +bool matched
    }
    
    class Experience {
        +str company
        +str title
        +str duration
        +str description
    }
    
    class Education {
        +str institution
        +str degree
        +str field
        +str year
    }
    
    class JobDescription {
        +str title
        +str description
        +List~str~ required_skills
        +List~str~ preferred_skills
        +float min_experience_years
        +str education_requirements
    }
    
    Candidate --> ContactInfo
    Candidate --> Skill
    Candidate --> Experience
    Candidate --> Education
```

---

## Process Flows

### 1. Resume Upload Flow

```mermaid
sequenceDiagram
    participant User
    participant UploadZone
    participant App
    participant API
    participant Backend
    participant FileSystem
    participant DB
    
    User->>UploadZone: Drag/Drop or Select Files
    UploadZone->>UploadZone: Validate file types (.pdf, .docx)
    UploadZone->>App: onFilesSelected(files)
    App->>App: setIsUploading(true)
    App->>App: Store files in fileContents state
    
    App->>API: uploadResumes(files)
    API->>Backend: POST /api/upload (FormData)
    
    loop For each file
        Backend->>Backend: Validate file extension
        Backend->>Backend: Generate UUID for candidate
        Backend->>FileSystem: Save file as {uuid}.{ext}
        Backend->>DB: Create Candidate record (status: PENDING)
    end
    
    Backend-->>API: UploadResponse {successful, failed, candidates}
    API-->>App: Upload result
    App->>App: setUploadedFiles(candidates)
    App->>App: loadStats()
    App->>App: setIsUploading(false)
    App-->>User: Show success message
```

### 2. Backend AI Analysis Flow (Gemini)

```mermaid
sequenceDiagram
    participant User
    participant JobForm
    participant App
    participant API
    participant Backend
    participant Parser
    participant AIAnalyzer
    participant Gemini
    participant Matcher
    participant DB
    
    User->>JobForm: Fill job description & click Analyze
    JobForm->>App: onSubmit(jobDescription)
    App->>App: setIsAnalyzing(true)
    App->>App: Start progress polling
    
    App->>API: analyzeResumes(jobDescription)
    API->>Backend: POST /api/analyze
    
    Backend->>DB: Get PENDING candidates
    
    loop For each candidate
        Backend->>Backend: Update progress
        Backend->>Parser: parse_file(file_path)
        
        alt PDF File
            Parser->>Parser: _parse_pdf()
            Parser->>Parser: Extract text with pdfplumber
        else DOCX File
            Parser->>Parser: _parse_docx()
            Parser->>Parser: Extract paragraphs & tables
        end
        
        Parser-->>Backend: resume_text
        
        Backend->>Parser: extract_basic_info(resume_text)
        Parser-->>Backend: {email, phone, linkedin, github}
        
        Backend->>AIAnalyzer: analyze_resume(resume_text, job_description)
        AIAnalyzer->>AIAnalyzer: _build_analysis_prompt()
        AIAnalyzer->>Gemini: generate_content(prompt)
        Gemini-->>AIAnalyzer: AI response (JSON)
        AIAnalyzer->>AIAnalyzer: _parse_ai_response()
        AIAnalyzer->>AIAnalyzer: _validate_and_normalize()
        AIAnalyzer-->>Backend: Analysis result
        
        Backend->>Matcher: calculate_match(candidate, job_description)
        Matcher-->>Backend: {match_score, skill_match_percentage}
        
        Backend->>DB: Update candidate (status: ANALYZED)
    end
    
    Backend->>Matcher: rank_candidates(analyzed_candidates)
    Matcher-->>Backend: Ranked candidates
    
    Backend-->>API: AnalysisResponse {candidates}
    API-->>App: Analysis result
    App->>App: setCandidates(ranked_candidates)
    App->>App: loadStats()
    App->>App: setIsAnalyzing(false)
    App-->>User: Show analyzed candidates
```

### 3. Puter.js AI Analysis Flow (Client-Side)

```mermaid
sequenceDiagram
    participant User
    participant JobForm
    participant App
    participant PuterAI
    participant PuterCloud
    
    User->>JobForm: Fill job description & click Analyze (Puter)
    JobForm->>App: onSubmitPuter(jobDescription)
    App->>App: setIsAnalyzing(true)
    App->>App: Get uploadedFiles from state
    
    loop For each uploaded file
        App->>App: Update progress UI
        App->>App: Get file from fileContents
        App->>App: readFileAsText(file)
        
        App->>PuterAI: analyzeResumeWithPuter(resumeText, jobDescription)
        PuterAI->>PuterAI: Build analysis prompt
        PuterAI->>PuterCloud: puter.ai.chat(prompt)
        Note over PuterCloud: Uses Claude Sonnet 4<br/>No API key required
        PuterCloud-->>PuterAI: AI response (JSON)
        PuterAI->>PuterAI: Parse and validate response
        PuterAI-->>App: Analysis result
        
        App->>App: Build analyzed candidate object
        App->>App: Add to analyzedCandidates array
    end
    
    App->>App: Sort candidates by match_score
    App->>App: setCandidates(analyzedCandidates)
    App->>App: Update stats locally
    App->>App: setIsAnalyzing(false)
    App-->>User: Show analyzed candidates
```

### 4. Candidate Management Flow

```mermaid
sequenceDiagram
    participant User
    participant CandidateCard
    participant App
    participant API
    participant Backend
    participant DB
    
    User->>CandidateCard: Click "View Details"
    CandidateCard->>App: onView(candidate)
    App->>App: setSelectedCandidate(candidate)
    App->>App: setIsModalOpen(true)
    App-->>User: Show CandidateModal
    
    alt Shortlist Action
        User->>CandidateCard: Click "Shortlist"
        CandidateCard->>App: onShortlist(candidateId)
        App->>App: Update local state (status: shortlisted)
        App->>App: Update stats (shortlisted++)
        App->>API: shortlistCandidate(candidateId)
        API->>Backend: POST /api/candidates/:id/shortlist
        Backend->>DB: Update candidate status
        Backend-->>API: Success response
    else Reject Action
        User->>CandidateCard: Click "Reject"
        CandidateCard->>App: onReject(candidateId)
        App->>App: Update local state (status: rejected)
        App->>App: Update stats (rejected++)
        App->>API: rejectCandidate(candidateId)
        API->>Backend: POST /api/candidates/:id/reject
        Backend->>DB: Update candidate status
        Backend-->>API: Success response
    end
    
    App-->>User: Show status message
```

---

## Data Flow Diagrams

### Resume Upload Data Flow

```mermaid
graph LR
    A[User Selects Files] --> B[File Validation]
    B --> C[FormData Creation]
    C --> D[HTTP POST to Backend]
    D --> E[File Storage]
    E --> F[UUID Generation]
    F --> G[Candidate Record Creation]
    G --> H[In-Memory DB Storage]
    H --> I[Response to Frontend]
    I --> J[Update UI State]
    
    style A fill:#3b82f6
    style E fill:#f59e0b
    style H fill:#10b981
    style J fill:#6366f1
```

### AI Analysis Data Flow (Backend Gemini)

```mermaid
graph TD
    A[Job Description Input] --> B[Candidate Selection]
    B --> C[File Retrieval]
    C --> D{File Type?}
    
    D -->|PDF| E[PDF Parser]
    D -->|DOCX| F[DOCX Parser]
    
    E --> G[Text Extraction]
    F --> G
    
    G --> H[Basic Info Extraction]
    H --> I[AI Prompt Building]
    I --> J[Gemini API Call]
    J --> K[JSON Response Parsing]
    K --> L[Data Validation]
    L --> M[Skill Matching]
    M --> N[Score Calculation]
    N --> O[Candidate Ranking]
    O --> P[Database Update]
    P --> Q[Frontend Response]
    
    style A fill:#3b82f6
    style J fill:#f59e0b
    style P fill:#10b981
    style Q fill:#6366f1
```

### AI Analysis Data Flow (Puter.js)

```mermaid
graph TD
    A[Job Description Input] --> B[Uploaded Files from State]
    B --> C[File Reading]
    C --> D[Text Extraction]
    D --> E[Prompt Building]
    E --> F[Puter.js AI Call]
    F --> G[Claude Sonnet 4 Processing]
    G --> H[JSON Response]
    H --> I[Response Parsing]
    I --> J[Data Validation]
    J --> K[Local Score Calculation]
    K --> L[Candidate Object Creation]
    L --> M[Local Sorting]
    M --> N[State Update]
    N --> O[UI Refresh]
    
    style A fill:#3b82f6
    style F fill:#10b981
    style G fill:#10b981
    style N fill:#6366f6
```

---

## Component Interactions

### Frontend Component Communication

```mermaid
graph TB
    subgraph "App.jsx - Central State Manager"
        State[Application State]
        Handlers[Event Handlers]
    end
    
    subgraph "UI Components"
        Sidebar[Sidebar]
        Upload[UploadZone]
        JobForm[JobDescriptionForm]
        Stats[StatsCards]
        CandList[Candidate List]
        Modal[CandidateModal]
    end
    
    subgraph "Service Layer"
        API[API Service]
        Puter[Puter AI Service]
    end
    
    Sidebar -->|Section Change| Handlers
    Upload -->|Files Selected| Handlers
    JobForm -->|Analyze Request| Handlers
    CandList -->|View/Shortlist/Reject| Handlers
    
    Handlers -->|Update| State
    State -->|Props| Sidebar
    State -->|Props| Upload
    State -->|Props| JobForm
    State -->|Props| Stats
    State -->|Props| CandList
    State -->|Props| Modal
    
    Handlers --> API
    Handlers --> Puter
    
    API -->|Response| Handlers
    Puter -->|Response| Handlers
```

### Backend Service Interactions

```mermaid
graph TB
    Router[API Router] --> UploadHandler[Upload Handler]
    Router --> AnalyzeHandler[Analyze Handler]
    Router --> CandidateHandler[Candidate Handler]
    
    UploadHandler --> FileSystem[File System]
    UploadHandler --> DB[(In-Memory DB)]
    
    AnalyzeHandler --> DB
    AnalyzeHandler --> Parser[Resume Parser]
    AnalyzeHandler --> AIAnalyzer[AI Analyzer]
    AnalyzeHandler --> Matcher[Candidate Matcher]
    
    Parser --> FileSystem
    AIAnalyzer --> Gemini[Gemini API]
    Matcher --> DB
    
    CandidateHandler --> DB
    
    style Router fill:#6366f1
    style DB fill:#10b981
    style Gemini fill:#f59e0b
```

---

## Key Features & Workflows

### 1. **Dual AI Mode Support**

The application supports two AI analysis modes:

| Feature | Backend Gemini | Puter.js Free AI |
|---------|----------------|------------------|
| **API Key Required** | Yes (GEMINI_API_KEY) | No |
| **Processing Location** | Server-side | Client-side |
| **AI Model** | Google Gemini Pro | Claude Sonnet 4 |
| **Cost** | Pay-per-use | Free |
| **File Parsing** | Backend (PyPDF2, python-docx) | Frontend (limited) |
| **Data Storage** | Backend database | Frontend state only |

### 2. **Real-Time Progress Tracking**

```javascript
// Frontend polls backend every 1 second
const progressInterval = setInterval(async () => {
  const progressData = await api.getProgress();
  setProgress(progressData);
}, 1000);
```

Backend updates progress:

```python
screening_progress = {
    "status": "analyzing",
    "progress": 50,
    "current_file": "john_doe_resume.pdf",
    "step": "parsing"
}
```

### 3. **Candidate Filtering & Ranking**

Candidates are automatically ranked by:

1. **Match Score** (0-100) - Overall job fit
2. **Skill Match Percentage** (0-100) - Required skills coverage

Filters available:

- All candidates
- Analyzed only
- Shortlisted
- Rejected

### 4. **File Upload & Storage**

**Frontend:**

- Drag-and-drop or click to browse
- Multiple file selection
- File type validation (.pdf, .docx, .doc)

**Backend:**

- Files saved as `{uuid}.{extension}`
- Stored in `backend/uploads/` directory
- Linked to candidate records via UUID

---

## API Endpoints Reference

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `POST` | `/api/upload` | Upload resume files | FormData with files | UploadResponse |
| `POST` | `/api/analyze` | Analyze resumes | AnalysisRequest | AnalysisResponse |
| `GET` | `/api/candidates` | Get all candidates | Query params (status, min_score, limit) | {candidates, total} |
| `GET` | `/api/candidates/:id` | Get single candidate | - | Candidate |
| `POST` | `/api/candidates/:id/shortlist` | Shortlist candidate | - | {message, candidate} |
| `POST` | `/api/candidates/:id/reject` | Reject candidate | - | {message, candidate} |
| `GET` | `/api/progress` | Get analysis progress | - | ScreeningProgress |
| `GET` | `/api/stats` | Get statistics | - | Stats object |
| `GET/POST` | `/api/job-description` | Get/Set job description | JobDescription | JobDescription |
| `DELETE` | `/api/candidates` | Clear all data | - | {message} |
| `GET` | `/health` | Health check | - | {status, api_configured} |

---

## Security & Best Practices

### Current Implementation

✅ **Implemented:**

- CORS middleware for frontend communication
- File type validation
- Input sanitization via Pydantic models
- Error handling and logging

⚠️ **Production Considerations:**

1. **Database:** Replace in-memory storage with PostgreSQL/MongoDB
2. **Authentication:** Add user authentication and authorization
3. **File Storage:** Use cloud storage (S3, GCS) instead of local filesystem
4. **API Rate Limiting:** Implement rate limiting for AI API calls
5. **Data Privacy:** Encrypt sensitive candidate information
6. **File Size Limits:** Add file size validation
7. **Session Management:** Implement proper session handling
8. **HTTPS:** Use HTTPS in production
9. **Environment Variables:** Secure API key management

---

## Performance Optimization

### Frontend

- Lazy loading for candidate list
- Debounced search/filter operations
- Memoization for expensive computations
- Code splitting for routes

### Backend

- Async file processing
- Background tasks for long-running operations
- Caching for frequently accessed data
- Connection pooling for database

---

## Error Handling

### Frontend Error Handling

```javascript
try {
  const result = await api.analyzeResumes(jobDescription);
  // Success handling
} catch (error) {
  setStatusMessage({ 
    type: 'error', 
    text: 'Analysis failed. Is the backend running?' 
  });
}
```

### Backend Error Handling

```python
try:
    analysis = await ai_analyzer.analyze_resume(resume_text, jd_dict)
except Exception as e:
    logger.error(f"AI analysis failed: {str(e)}")
    return self._get_fallback_analysis(resume_text)
```

---

## Conclusion

This AI Resume Screener application demonstrates a modern full-stack architecture with:

- **Flexible AI Integration** - Dual mode support (Backend Gemini + Client-side Puter.js)
- **Robust File Processing** - Multi-format resume parsing (PDF, DOCX)
- **Real-Time Feedback** - Progress tracking and status updates
- **Clean Architecture** - Separation of concerns with service layers
- **User-Friendly Interface** - Intuitive UI with dark/light mode
- **Scalable Design** - Ready for production enhancements

The system efficiently processes resumes through a well-defined pipeline: Upload → Parse → Analyze → Match → Rank, providing recruiters with actionable insights for candidate evaluation.
