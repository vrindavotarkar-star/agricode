@echo off
echo Starting Kisan Call Centre - Simple Version
echo ==========================================

echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate.bat && python app/main.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && venv\Scripts\activate.bat && streamlit run app.py"

echo.
echo Servers starting...
echo.
echo Wait 10-15 seconds, then:
echo 1. Open http://localhost:8000/health to test backend
echo 2. Open http://localhost:8501 for the application
echo.
echo If you see directory listings, the servers didn't start.
echo Check the command windows for error messages.
echo.
pause
