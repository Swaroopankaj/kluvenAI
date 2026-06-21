@echo off
cd /d "%~dp0"

echo [SUCCESS] kluvenAI
echo [INFO] Starting backend and frontend services
echo.

REM Check prerequisites
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Install from https://python.org/
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org/
    pause
    exit /b 1
)

REM Check .env
if not exist backend\.env (
    echo [ERROR] No backend\.env file found.
    echo [INFO] Copy backend\.env.example to backend\.env and add your API key.
    pause
    exit /b 1
)

REM Install backend deps
echo [INFO] Installing backend dependencies...
cd backend
pip install -r requirements.txt -q
if %errorlevel% neq 0 (
    echo [ERROR] Backend dependency install failed
    pause
    exit /b 1
)

REM Start backend
echo [INFO] Starting backend on http://localhost:8000
start "kluvenAI Backend" cmd /c "python -m uvicorn main:app --reload --port 8000"
cd ..

REM Install and start frontend
echo [INFO] Installing frontend dependencies...
cd frontend
call npm install 2>nul
echo [INFO] Starting frontend on http://localhost:5173
start "kluvenAI Frontend" cmd /c "npx vite --host"
cd ..

echo.
echo [SUCCESS] kluvenAI is running!
echo [INFO]  Frontend: http://localhost:5173
echo [INFO]  Backend:  http://localhost:8000
echo.
echo Press any key to exit both servers...
pause

REM Kill both server processes
taskkill /fi "WindowTitle eq kluvenAI Backend*" /f >nul 2>&1
taskkill /fi "WindowTitle eq kluvenAI Frontend*" /f >nul 2>&1
