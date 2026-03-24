@echo off
echo Business Analytics System - Development Server Starter
echo.
echo Starting backend server on http://localhost:8000
echo Starting frontend server on http://localhost:3000
echo.
echo Press Ctrl+C to stop any server
echo.

REM Check if backend virtual environment exists
if not exist "backend\venv" (
    echo Creating virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing backend dependencies...
    pip install -r requirements.txt
    cd ..
)

REM Start backend in a new window
echo Starting Django backend...
start cmd /k "cd backend && venv\Scripts\activate.bat && python manage.py runserver"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Start frontend in a new window
echo Starting React frontend...
start cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting. Opening browser...
timeout /t 3 /nobreak
start http://localhost:3000

echo.
echo Servers started! Open your browser to http://localhost:3000
echo Backend API: http://localhost:8000
