# AI Resume Screening & Candidate Evaluation System

An AI-powered platform for intelligent resume screening and automated candidate evaluation.

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Google Gemini API Key

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
# Create .env file with GEMINI_API_KEY=your_key
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── config.py         # Configuration
│   │   ├── models/           # Pydantic models
│   │   ├── services/         # Business logic
│   │   └── routes/           # API endpoints
│   └── requirements.txt
│
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Pages
│   │   └── services/         # API calls
│   └── package.json
```

## ✨ Features

- 📤 Bulk resume upload (PDF/DOCX)
- 📝 Job description-based matching
- 🤖 AI-powered candidate analysis
- 📊 Skill gap visualization
- 🌙 Dark/Light mode
- 📋 Export reports
