@echo off
echo =================================
echo     Personal Blog Public Server
echo =================================
echo.

cd /d "%~dp0"

:: Check if dependencies are installed
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
    echo.
)

if not exist "%~dp0\py.exe" (
    echo Checking for Python...
    python --version >nul 2>&1
    if errorlevel 1 (
        echo Python not found. Please install Python first.
        echo Download from: https://www.python.org/downloads/
        pause
        exit /b 1
    ) else (
        echo Python found.
    )
)
echo.

:MENU
echo Select access method:
echo.
echo 1. Local server (LAN access only)
echo 2. LocalXpose (Public URL - recommended)
echo 3. ngrok (Public URL)
echo 4. Both Local + Public URL
echo 5. Exit
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto LOCAL_ONLY
if "%choice%"=="2" goto LOCALXPOSE
if "%choice%"=="3" goto NGROK
if "%choice%"=="4" goto BOTH
if "%choice%"=="5" exit /b 0
echo Invalid choice. Please try again.
echo.
goto MENU

:LOCAL_ONLY
echo.
echo =================================
echo     Starting Local Server Only
echo =================================
echo.
echo Access URLs:
echo   Local:      http://localhost:8000
echo   On Network: http://10.36.53.110:8000
echo.
echo Press Ctrl+C to stop the server
echo.
node server.js
pause
goto MENU

:LOCALXPOSE
echo.
echo =================================
echo     Starting with LocalXpose
echo =================================
echo.
echo 1. Install LocalXpose if not already installed:
echo    Download from: https://github.com/localtunnel/localxpose/releases
echo.
echo 2. After installing, select this option again
echo.
set /p lx_choice="Do you have LocalXpose installed? (y/n): "
if /i "%lx_choice%"=="n" (
    echo Please download and install LocalXpose first:
    echo https://github.com/localtunnel/localxpose/releases
    pause
    goto MENU
)

echo.
echo Starting server with LocalXpose...
echo.
echo Starting Node.js server in background...
start "Node.js Server" node server.js

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting LocalXpose...
lxpe http --port=8000
pause
goto MENU

:NGROK
echo.
echo =================================
echo     Starting with ngrok
echo =================================
echo.
echo 1. Install ngrok if not already installed:
echo    Download from: https://ngrok.com/download
echo.
echo 2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
echo.
set /p ngrok_choice="Do you have ngrok installed? (y/n): "
if /i "%ngrok_choice%"=="n" (
    echo Please download and install ngrok first:
    echo https://ngrok.com/download
    pause
    goto MENU
)

echo.
echo Enter your ngrok authtoken (or press Enter to skip authtoken setup):
set /p ngrok_token=

if not "%ngrok_token%"=="" (
    echo Setting ngrok authtoken...
    ngrok config add-authtoken %ngrok_token%
)

echo.
echo Starting server with ngrok...
echo.
echo Starting Node.js server in background...
start "Node.js Server" node server.js

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting ngrok...
ngrok http 8000
pause
goto MENU

:BOTH
echo.
echo =================================
echo     Starting Both Local and Public
echo =================================
echo.
echo This will start the server and create a public URL
echo.

:: Start Node.js server in background
echo Starting Node.js server...
start "Node.js Server - Blog" node server.js
timeout /t 3 /nobreak >nul

echo.
echo Server URLs:
echo   Local:      http://localhost:8000
echo   Network:   http://10.36.53.110:8000
echo.

echo.
echo Choose public access method:
echo 1. LocalXpose (easier)
echo 2. ngrok (more reliable)
echo 3. None
set /p pub_choice="Enter choice (1-3): "

if "%pub_choice%"=="1" (
    echo.
    echo Starting LocalXpose...
    lxpe http --port=8000
) else if "%pub_choice%"=="2" (
    echo.
    echo Starting ngrok...
    ngrok http 8000
) else (
    echo.
    echo Only local access available.
    echo Keep this window open to maintain access.
    pause
)

goto MENU