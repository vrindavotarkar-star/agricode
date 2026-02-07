# Kisan Call Centre Query Assistant - Installation Script
# Compatible with Windows PowerShell 5+

Write-Host "Kisan Call Centre Query Assistant Installation" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check Python installation
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH. Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Create backend virtual environment
Write-Host "Setting up backend..." -ForegroundColor Yellow
cd backend
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}
python -m venv venv
& "venv\Scripts\activate.ps1"
pip install -r requirements.txt

# Create database
Write-Host "Creating database..." -ForegroundColor Yellow
python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"
Write-Host "Database created successfully!" -ForegroundColor Green

deactivate
cd ..

# Create frontend virtual environment
Write-Host "Setting up frontend..." -ForegroundColor Yellow
cd frontend
if (Test-Path "venv") {
    Write-Host "Virtual environment already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}
python -m venv venv
& "venv\Scripts\activate.ps1"
pip install -r requirements.txt
deactivate
cd ..

Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "To start the application:" -ForegroundColor White
Write-Host "1. Start backend: cd backend && venv\Scripts\activate && python app/main.py" -ForegroundColor White
Write-Host "2. Start frontend (in new terminal): cd frontend && venv\Scripts\activate && streamlit run app.py" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor White
Write-Host "Frontend: http://localhost:8501" -ForegroundColor White
