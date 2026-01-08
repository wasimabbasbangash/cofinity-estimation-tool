#!/bin/bash

# Start backend server
echo "Starting backend server on port 3008..."
cd server
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "Starting frontend server on port 3009..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo "Both servers are running!"
echo "Backend: http://localhost:3008"
echo "Frontend: http://localhost:3009"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

