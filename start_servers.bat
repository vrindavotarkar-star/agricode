@echo off
echo Starting Kisan Call Centre Servers...
echo =====================================

echo Starting backend server in new window...
start "Backend Server" cmd /k "cd backend && venv\Scripts\activate && python app/main.py"

timeout /t 3 /nobreak > nul

echo Starting frontend server in new window...
start "Frontend Server" cmd /k "cd frontend && venv\Scripts\activate && streamlit run app.py"

echo.
echo Servers starting... Please wait a few seconds.
echo.
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:8501
echo.
echo API Documentation: http://localhost:8000/docs
echo.
echo Press any key to close this window...
pause > nul
