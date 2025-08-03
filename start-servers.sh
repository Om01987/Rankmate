#!/bin/bash

echo "Starting RRB Proxy Application..."
echo

echo "Starting Backend Server..."
cd rrb-proxy-server
npm install
node server.js &
BACKEND_PID=$!

echo
echo "Starting Frontend Server..."
cd ../frontend
npm install
npm start &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to press Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 