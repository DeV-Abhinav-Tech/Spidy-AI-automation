@echo off
title Spidy Task Automation Assistant - Local Launcher
color 0B
cls
echo ================================================================
echo      SPIDY TASK AUTOMATION ASSISTANT - LOCAL ENVIRONMENT
echo ================================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "Spidy Backend (FastAPI)" cmd /k "cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

echo [2/2] Starting React + Vite Frontend on http://127.0.0.1:5173 ...
start "Spidy Frontend (Vite)" cmd /k "cd frontend && npm run dev -- --port 5173 --host 127.0.0.1"

echo.
echo All services launched!
echo - Frontend Dashboard: http://127.0.0.1:5173
echo - Backend API Docs:   http://127.0.0.1:8000/docs
echo.
timeout /t 3 >nul
start http://127.0.0.1:5173
exit
