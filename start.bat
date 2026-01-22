@echo off
title AI Resume Screener - Launcher
color 0A

echo ============================================
echo    AI Resume Screener - Starting Servers
echo ============================================
echo.

:: Check if .env file exists, if not create from example
if not exist "backend\.env" (
    echo Creating .env file from template...
    copy "backend\.env.example" "backend\.env" >nul 2>&1
    echo [WARNING] Please add your GEMINI_API_KEY to backend\.env
    echo.
)

echo Starting Backend Server (FastAPI)...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && py -m uvicorn app.main:app --reload --port 8000"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Vite)...
start "Frontend - Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait a moment for frontend to start
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo    Servers Started Successfully!
echo ============================================
echo.
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:5173
echo    API Docs: http://localhost:8000/docs
echo.
echo    Opening application in browser...
echo ============================================

:: Open browser
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo Press any key to close this launcher window...
echo (Note: This will NOT stop the servers)
pause >nul
