#!/usr/bin/env python3
"""
AI Resume Screener - Server Launcher
Run this file to start both backend and frontend servers.

Usage: python run.py
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.absolute()
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
VENV_DIR = BACKEND_DIR / "venv"

# Server URLs
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"


def print_banner():
    """Print startup banner"""
    print("\n" + "=" * 50)
    print("   🎯 AI Resume Screener - Server Launcher")
    print("=" * 50 + "\n")


def check_venv():
    """Check if virtual environment exists"""
    if sys.platform == "win32":
        python_path = VENV_DIR / "Scripts" / "python.exe"
    else:
        python_path = VENV_DIR / "bin" / "python"
    
    if not python_path.exists():
        print("❌ Virtual environment not found!")
        print("   Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], check=True)
        
        # Install dependencies
        print("   Installing dependencies...")
        pip_path = VENV_DIR / "Scripts" / "pip" if sys.platform == "win32" else VENV_DIR / "bin" / "pip"
        subprocess.run([str(pip_path), "install", "-r", str(BACKEND_DIR / "requirements.txt")], check=True)
        print("   ✅ Virtual environment created!\n")
    
    return python_path


def check_node_modules():
    """Check if node_modules exists"""
    node_modules = FRONTEND_DIR / "node_modules"
    if not node_modules.exists():
        print("❌ Node modules not found!")
        print("   Installing npm dependencies...")
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, check=True)
        print("   ✅ Dependencies installed!\n")


def check_env_file():
    """Check if .env file exists, create from template if not"""
    env_file = BACKEND_DIR / ".env"
    env_example = BACKEND_DIR / ".env.example"
    
    if not env_file.exists() and env_example.exists():
        print("📝 Creating .env file from template...")
        with open(env_example, 'r') as src, open(env_file, 'w') as dst:
            dst.write(src.read())
        print("⚠️  Please add your GEMINI_API_KEY to backend/.env\n")


def start_backend():
    """Start the FastAPI backend server"""
    print("🚀 Starting Backend Server (FastAPI)...")
    
    if sys.platform == "win32":
        # Windows: start in new console window using venv python
        venv_python = VENV_DIR / "Scripts" / "python.exe"
        cmd = f'start "Backend - FastAPI" cmd /k "cd /d {BACKEND_DIR} && "{venv_python}" -m uvicorn app.main:app --reload --port 8000"'
        subprocess.Popen(cmd, shell=True)
    else:
        # Linux/Mac: start in background using venv python
        venv_python = VENV_DIR / "bin" / "python"
        subprocess.Popen(
            [str(venv_python), "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
            cwd=BACKEND_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    
    print(f"   ✅ Backend starting at {BACKEND_URL}")


def start_frontend():
    """Start the Vite frontend server"""
    print("🚀 Starting Frontend Server (Vite)...")
    
    if sys.platform == "win32":
        # Windows: start in new console window
        cmd = f'start "Frontend - Vite" cmd /k "cd /d {FRONTEND_DIR} && npm run dev"'
        subprocess.Popen(cmd, shell=True)
    else:
        # Linux/Mac: start in background
        subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=FRONTEND_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    
    print(f"   ✅ Frontend starting at {FRONTEND_URL}")


def open_browser():
    """Open the application in default browser"""
    print("\n🌐 Opening application in browser...")
    time.sleep(3)  # Wait for servers to start
    webbrowser.open(FRONTEND_URL)


def print_info():
    """Print server information"""
    print("\n" + "=" * 50)
    print("   ✅ Servers Started Successfully!")
    print("=" * 50)
    print(f"\n   🔧 Backend:  {BACKEND_URL}")
    print(f"   🌐 Frontend: {FRONTEND_URL}")
    print(f"   📚 API Docs: {BACKEND_URL}/docs")
    print("\n" + "=" * 50)
    print("   Close the terminal windows to stop servers")
    print("=" * 50 + "\n")


def main():
    """Main entry point"""
    print_banner()
    
    # Check dependencies
    check_venv()
    check_node_modules()
    check_env_file()
    
    # Start servers
    start_backend()
    time.sleep(2)
    start_frontend()
    
    # Print info and open browser
    print_info()
    open_browser()


if __name__ == "__main__":
    main()
