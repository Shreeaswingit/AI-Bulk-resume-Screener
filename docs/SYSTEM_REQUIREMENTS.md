# Hardware and Software Requirements

To successfully run and deploy the AI Resume Screening System, the following configurations are required.

## 1. Hardware Requirements

Since the heavy processing (AI Analysis) is offloaded to the Cloud (Google Gemini API), the local resource requirements are moderate.

### A. Server (For Deployment/Hosting)

* **Processor**: Dual Core 2.0 GHz or higher (e.g., Intel i3/i5 or AMD equivalent).
* **RAM**:
  * Minimum: 4 GB.
  * Recommended: 8 GB (to handle concurrent file parsing and API requests smoothly).
* **Storage**:
  * 512 MB for application code and dependencies.
  * Additional temporary space required for storing uploaded resumes (cleaned up periodically). SSD recommended.
* **Network**: Active Internet connection is **mandatory** to communicate with the Google Gemini API.

### B. Client (User's Machine)

* **Device**: Desktop, Laptop, or Tablet.
* **Screen Resolution**: 1280x720 minimum (1920x1080 recommended for best dashboard view).
* **Peripherals**: Keyboard and Mouse/Trackpad.

---

## 2. Software Requirements

### A. System Environment

* **Operating System**:
  * Windows 10/11
  * macOS (Catalina or later)
  * Linux (Ubuntu 20.04/22.04 LTS)
* **Web Browser**: Modern browser with JavaScript enabled (Google Chrome, Firefox, Edge, or Safari).

### B. Development Stack & Dependencies

#### **Backend (Server-Side)**

* **Language**: Python 3.9 or higher.
* **Framework**: FastAPI (for high-performance API handling).
* **Key Libraries**:
  * `uvicorn`: ASGI server implementation.
  * `google-generativeai`: Client library for Gemini API.
  * `pypdf`, `pdfplumber`: For PDF text extraction.
  * `python-docx`: For MS Word text extraction.
  * `pydantic`: For data validation.

#### **Frontend (Client-Side)**

* **Runtime**: Node.js v18 (LTS) or higher.
* **Package Manager**: npm (v9+) or yarn.
* **Framework**: React.js (v18).
* **Build Tool**: Vite.
* **Styling**: Vanilla CSS / Tailwind CSS (depending on implementation).
* **HTTP Client**: Axios.

### C. External Services

* **AI Provider**: Google Gemini API Key (Pro Vision or Flash model) is required for the analysis engine to function.
