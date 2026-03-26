# AI Resume Screening & Candidate Evaluation System

## 1. Introduction

The AI Resume Screening & Candidate Evaluation System is an intelligent platform designed to streamline and automate the initial stages of recruitment. In today’s highly competitive talent market, organizations receive hundreds of applications for a single job opening. Manually screening these resumes is a time-consuming, resource-intensive, and error-prone process. This system addresses this challenge by providing a unified, AI-powered framework that parses candidate documents, analyzes their skills and experience against a given job description, and provides actionable insights for recruiters.

At the core of this system lies a Generative AI-driven matching engine that goes beyond traditional keyword matching. It understands the semantic meaning of candidate experiences, identifies critical skill gaps, and scores candidates uniformly, ensuring a fair and efficient screening process.

### 1.1 Importance Of The Project

The significance of this project lies in fixing the most obvious bottleneck in enterprise hiring: candidate shortlisting. Accurate resume parsing ensures that no qualified candidate is overlooked due to formatting issues or lack of exact keyword matches. 

This project is significant for the following reasons:
*   **Automates bulk resume parsing**: Rapidly processes PDF and DOCX files.
*   **Improves matching accuracy**: Uses AI for contextual analysis of candidate profiles against job requirements.
*   **Reduces manual bias**: Standardizes the evaluation of resumes.
*   **Enhances operational efficiency**: Detects duplicate submissions and generates automated visual summaries and reports.
*   **Provides a scalable foundation**: The modular architecture allows future integrations with full-fledged Applicant Tracking Systems (ATS).

### 1.2 General Organization of the Report

The project documentation is structured to progress logically from system limitations to implementation details:
*   **Chapter 1 – Introduction**: Presents the background, project importance, and objectives.
*   **Chapter 2 – System Analysis**: Discusses the limitations of existing manual systems, proposed solutions, and system requirements.
*   **Chapter 3 – System Design**: Explains the architecture, workflows, data flow, and GUI principles.
*   **Chapter 4 – Project Description**: Details the functional scope and real-world operational scenarios.
*   **Chapter 5 – System Development**: Highlights the technologies, robust tools, and development workflows.

### 1.3 Organization Profile

For any modern enterprise, talent acquisition is a critical competitive advantage. Organizations require intelligent recruitment tools to quickly identify the best fit for specific roles. By integrating this scalable AI Resume Screener, HR departments and technical recruitment teams can process massive batches of candidate applications efficiently, reducing time-to-hire while maintaining high standards for technical and cultural fit.

---

## 2. System Analysis

### 2.1 Problem Definition

In rapidly scaling companies, the management and screening of applicant data remain a critical bottleneck. Despite the importance of finding the right talent, many organizations still rely on rudimentary keyword-based ATS platforms or manual inspection. 

Traditional keyword ATS systems look for exact string matches. A highly qualified candidate might use a synonym or a slightly different title, leading to an unwarranted rejection. Furthermore, existing systems do not adequately analyze the *depth* of skill or experience, nor do they accurately generate visual summaries of a candidate's "skill gap" compared to the ideal job description.

### 2.2 Existing System

Current recruitment processes are primarily manual or utilize rigid structures. This results in:
*   **Heavy manual review**: Recruiters spend excessive hours manually reading and grouping applications.
*   **Inconsistency**: The accuracy of the screening depends entirely on the recruiter's expertise or fatigue level.
*   **Lack of structured insights**: Absence of automated, objective scoring or centralized reporting (skill gaps, strengths).
*   **Inefficiency in bulk processing**: Processing high volumes of resumes (e.g., during campus recruitment drives) often crashes or slows down legacy systems.

### 2.3 Proposed System

To resolve the limitations of traditional candidate processing, the proposed solution is a modern, web-based platform featuring an intelligent processing pipeline. The system utilizes:
*   **FastAPI (Python)** for rapid, asynchronous backend processing.
*   **Google Gemini Generative AI** to semantically map resumes against complex job descriptions.
*   **React + Vite** for a modern, responsive user interface with drag-and-drop support.

Key advantages of the proposed system include:
*   Advanced extraction of text from rigid formats (PDF/DOCX) using libraries like `PyPDF2`, `pdfplumber`, and `python-docx`.
*   Direct AI evaluation providing Match Percentages, Pros, Cons, and a Skill Gap Analysis.
*   A responsive dashboard supporting Light/Dark themes and interactive charts for faster decision-making.
*   Built-in duplicate detection and an automated Email notification service to streamline communications.

### 2.4 System Requirements

#### 2.4.1 Hardware Requirements
*   **Processor**: Intel i3 / AMD Ryzen 3 or higher
*   **RAM**: Minimum 8 GB (16 GB recommended for local testing)
*   **Storage**: 256 GB SSD or higher
*   **Display Resolution**: 1366 × 768 or above

#### 2.4.2 Software Requirements
*   **Operating System**: Windows 10 / Windows 11 / macOS / Linux
*   **Backend Environment**: Python 3.9+ 
*   **Frontend Environment**: Node.js 18+, npm
*   **External Service APIs**: Google Gemini API Key
*   **Browser**: Google Chrome / Microsoft Edge / Firefox

---

## 3. System Design

### 3.1 Architectural Design

The system implements a decoupled modern web architecture comprising a Presentation Layer (React), an Application Layer (FastAPI REST APIs), and an Intelligence Layer (Google Gemini API).

#### 3.1.1 Data Flow Diagram (DFD)

1.  **Input Flow (The Gateway)**: Users upload bulk resumes and provide a Job Description (JD).
2.  **Processing Flow (Parsing Engine)**: The `resume_parser.py` extracts raw text from varied document formats (PDF/DOCX). The `duplicate_detector.py` ensures the same candidate is not evaluated redundantly.
3.  **Intelligence Flow (AI Analyzer & Matcher)**: Extracted text and JD are passed to `ai_analyzer.py` and `matcher.py`. They query the LLM to structure candidate data, evaluate fitment, and assign a definitive match score.
4.  **Output Flow (Presentation)**: The AI's JSON output is aggregated and sent back to the React UI, displaying an interactive dashboard featuring candidate cards, exact skill gaps, and an option to export reports. Notifications can then be triggered via `email_service.py`.

### 3.2 GUI Design

The GUI is designed as an interactive, Single Page Application (SPA). Design highlights include:
*   **Dashboard view**: Centralized view of all processed candidates sorted by match percentage.
*   **Interactive Evaluation Modals**: Detailed pop-ups showing AI notes, strengths, weaknesses, and skill gaps dynamically.
*   **Drag-and-Drop Uploader**: Intuitive interface for massive file uploads.
*   **Theming**: Integrated Dark Mode/Light Mode toggle.

### 3.3 UML / Object Architecture Highlights

The core business logic comprises these essential entities:
*   **Candidate**: Characteristics include `Name`, `Email`, `Phone`, `ExtractedSkills`, and `RawText`.
*   **JobPost**: Defines the benchmark, holding `Title`, `Description`, and `ExpectedKeywords`.
*   **EvaluationResult**: The linkage between Candidate and JobPost, recording `MatchScore`, `SkillGap`, `Strengths`, and `Weaknesses`.

### 3.4 ER DIAGRAM (Conceptual)

The conceptual data structure forms a one-to-many relationship where:
*   A single `Job Profile` evaluates multiple `Candidate Profiles`.
*   Each `Candidate Profile` maintains its extracted `Metadata` and a unique `Evaluation Score` bound to specific job roles.

---

## 4. Project Description

The AI Resume Screening system entirely transforms how recruiters handle initial candidate outreach and sorting. Under the hood, components act autonomously to streamline applicant data:

*   **Document Processor (`resume_parser.py`)**: Gracefully handles encodings, disparate fonts, and formatting tables found within complex PDF and DOCX files.
*   **Deduplication logic (`duplicate_detector.py`)**: Uses distinct metrics (like email extraction) to flag duplicates automatically, ensuring API quotas are preserved.
*   **Analytical Engine (`ai_analyzer.py` / `matcher.py`)**: It asks the Generative API specific prompts to generate structured evaluations. Instead of saying "Java missing", it outlines how heavily the candidate's existing background might substitute for missing requirements, yielding an intelligent numerical score.
*   **Communications (`email_service.py`)**: Connects directly with SMTP boundaries to allow the recruiter to email shortlisted candidates without leaving the platform.

Each module handles its errors gracefully, keeping the main application responsive and preventing overall failures due to a single corrupted resume structure.

---

## 5. System Development

### 5.1 Languages and Tools Used

*   **Backend**: Python, utilizing the highly performant FastAPI framework along with Uvicorn (ASGI server) and Pydantic for rigorous data validation.
*   **Frontend**: React (via Vite) configured with HTML5, modern CSS3 variables for theming, and JavaScript/JSX for dynamic DOM manipulation.
*   **AI Models**: The `google-generativeai` SDK connects the logic to Gemini, taking advantage of large context window capabilities.
*   **Parsers**: `PyPDF2`, `pdfplumber`, and `python-docx` form the primary extraction toolkit.

### 5.2 Development Workflow and Pseudocode

The flow captures a scalable and robust approach, protecting backend API connections and efficiently managing state on the frontend:

```text
1) START
2) Initialize React App / Serve FastAPI API endpoints
3) USER provides "Job Description Data" and "Resume File(s)"
4) ON submit_request:
5)     FOR EACH file IN uploaded_resumes:
6)         Process file -> resume_parser.extract_text()
7)         IF is_duplicate(file_metadata) THEN
8)             Flag as Duplicate & Skip AI call
9)         ELSE
10)            Send text + job_description -> ai_analyzer.evaluate_candidate()
11)            Parse AI JSON response -> Generate MatchScore & SkillGap
12)        END IF
13)        Store and map Candidate Result Data
14)    END FOR
15) SORT compiled Candidate Results by MatchScore DESC
16) RENDER Dashboard with visual charts & insights
17) STOP
```

This structured pipeline ensures the AI Resume Screening Application seamlessly marries the capabilities of modern frontends with powerful LLMs, achieving an exceptionally fast and highly scalable candidate evaluation environment.
