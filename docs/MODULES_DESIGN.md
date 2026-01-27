# System Modules Design

The application works on a Client-Server architecture, divided efficiently into a Frontend User Interface and a Backend Processing Unit.

## 1. Frontend Modules (Client-Side)

Built with **React.js (Vite)**, the frontend focuses on user experience and real-time feedback.

### A. Core Components

| Component Name | Description |
| :--- | :--- |
| **UploadZone** | Handles file drag-and-drop functionality, validates file types (PDF/DOCX), and manages the initial API upload requests. |
| **JobDescriptionForm** | Allows recruiters to input or paste Job Descriptions (JD). This acts as the "ground truth" for the AI analysis. |
| **CandidateCard** | Displays a summary of each candidate, including their photo (placeholder), key skills, and the AI-calculated Match Score. |
| **CandidateModal** | A detailed view that opens when a card is clicked. It shows the full AI analysis: Contact Info, Education, Experience, Strengths, and Concerns. |
| **ScreeningProgress** | specific UI component that polls the backend to show the real-time status of resume parsing and analysis (e.g., "Parsing file 1 of 5..."). |
| **StatsCards** | Dashboard widgets displaying high-level metrics: Total Candidates, Analyzed, Shortlisted, Rejected. |
| **Sidebar** | Navigation module providing access to different views like "Dashboard," "All Candidates," and "Settings." |

---

## 2. Backend Modules (Server-Side)

Built with **FastAPI (Python)**, the backend handles the heavy lifting of file processing and AI integration.

### A. API Routes (`/app/routes`)

- **`screening.py`**: The primary controller.
  - `POST /upload`: Receives and saves resume files.
  - `POST /analyze`: Triggers the AI pipeline.
  - `GET /candidates`: Retrieves processed results.
  - `GET /stats`: Computes dashboard metrics.

### B. Service Modules (`/app/services`)

These contain the core business logic:

1. **`resume_parser.py`**
    - **Role**: Text Extraction.
    - **Function**: Uses `PyPDF2` or `pdfplumber` for PDFs and `python-docx` for Word documents to extract raw text content from files. cleans and sanitizes text for the AI.

2. **`ai_analyzer.py`** (The Brain)
    - **Role**: AI Inference.
    - **Function**: Constructs prompt engineering templates sent to **Google Gemini AI**. It asks the LLM to extract structured JSON data (Name, Skills, Experience) and interpret the candidate's fit for the specific JD.

3. **`matcher.py` (Candidate Matcher)**
    - **Role**: Scoring Algorithm.
    - **Function**: Although the AI provides an initial evaluation, this module performs deterministic calculations or weighs specific criteria (like "Years of Experience" vs "Required Skills") to generate a final ranked `match_score` (0-100%).

---

## 3. Data Flow Integration

- **State Management**: The Frontend uses React Hooks (`useState`, `useEffect`) to manage the list of candidates.
- **Communication**: RESTful APIs via `axios` connect the React frontend to the FastAPI backend.
- **Storage**: Currently file-based/in-memory for the session (files stored in `uploads/`, metadata in Python dictionaries).
