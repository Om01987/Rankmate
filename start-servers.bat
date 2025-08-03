@echo off
echo Starting RRB Proxy Application...
echo.

echo Starting Backend Server...
cd rrb-proxy-server
start "Backend Server" cmd /k "npm install && node server.js"

echo.
echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm install && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit this launcher...
pause > nul 