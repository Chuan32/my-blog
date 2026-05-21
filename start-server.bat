@echo off
echo Starting Personal Blog Server...
echo.
echo This will start a local web server on port 8000
echo.
echo Local URL: http://localhost:8000
echo Network URL: http://10.36.53.110:8000
echo.
echo IMPORTANT: Keep this window open to keep the website running!
echo Press Ctrl+C to stop the server.
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

:: Start the server
echo Starting server...
node server.js

echo.
echo Server stopped.
pause