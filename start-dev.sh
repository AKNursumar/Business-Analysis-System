#!/bin/bash

echo "Business Analytics System - Development Server Starter"
echo ""
echo "Starting backend server on http://localhost:8000"
echo "Starting frontend server on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop any server"
echo ""

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
    cd ..
fi

# Start backend in background
echo "Starting Django backend..."
cd backend
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start frontend in background
echo "Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers are starting."
echo "Servers started! Open your browser to http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"

wait $BACKEND_PID $FRONTEND_PID
