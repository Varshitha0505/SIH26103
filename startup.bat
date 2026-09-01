@echo off
REM Startup script for ProjectIQ SIH26103
REM This script installs dependencies and runs the full stack

echo ========================================
echo ProjectIQ Startup Script
echo ========================================
echo.

REM Step 1: Install Python Dependencies
echo [1] Installing Python dependencies...
cd /d C:\Users\DELL\Desktop\SIH26103\SIH26103
python -m pip install --upgrade pip
pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo [1] Python dependencies installed successfully
echo.

REM Step 2: Install Node dependencies
echo [2] Installing Node.js dependencies...
cd /d C:\Users\DELL\Desktop\SIH26103\SIH26103\frontend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Node dependencies
    pause
    exit /b 1
)

echo [2] Node dependencies installed successfully
echo.

REM Step 3: Start Flask Backend in new window
echo [3] Starting Flask Backend...
start cmd /k "cd /d C:\Users\DELL\Desktop\SIH26103\SIH26103\ML-engine && python app.py"

REM Step 4: Start React Frontend in new window
echo [4] Starting React Frontend...
start cmd /k "cd /d C:\Users\DELL\Desktop\SIH26103\SIH26103\frontend && npm run dev"

echo.
echo ========================================
echo Startup complete!
echo ========================================
echo Backend: http://127.0.0.1:5000
echo Frontend: http://localhost:5173 (or check console for URL)
echo.
pause
