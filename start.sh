#!/bin/bash

# 1. Start the Database
echo "Starting PostgreSQL Database via Docker..."
cd backend
docker compose up -d

# 2. Start the Python Backend in the background
echo "Starting Python API (Uvicorn)..."
source venv/bin/activate
uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 3. Start the Next.js Frontend
echo "Starting Next.js Frontend..."
cd ../frontend
npm run dev

# Trap CTRL+C to kill the background python process when you stop the frontend
trap "kill $BACKEND_PID; echo 'Shut down Python Backend'" EXIT
