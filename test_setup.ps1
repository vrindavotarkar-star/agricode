Write-Host "Testing Kisan Call Centre Setup..." -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if virtual environments exist
if (Test-Path "backend\venv") {
    Write-Host "✓ Backend virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "✗ Backend virtual environment missing. Run .\install.ps1 first" -ForegroundColor Red
}

if (Test-Path "frontend\venv") {
    Write-Host "✓ Frontend virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend virtual environment missing. Run .\install.ps1 first" -ForegroundColor Red
}

# Test backend imports
Write-Host "Testing backend imports..." -ForegroundColor Yellow
cd backend
& "venv\Scripts\activate.ps1"
try {
    python -c "from app.main import app; print('✓ Backend imports successful')"
} catch {
    Write-Host "✗ Backend import failed: $_" -ForegroundColor Red
}
deactivate
cd ..

# Test frontend imports
Write-Host "Testing frontend imports..." -ForegroundColor Yellow
cd frontend
& "venv\Scripts\activate.ps1"
try {
    python -c "import streamlit as st; print('✓ Frontend imports successful')"
} catch {
    Write-Host "✗ Frontend import failed: $_" -ForegroundColor Red
}
deactivate
cd ..

Write-Host "Setup test complete!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "If all checks passed, run:" -ForegroundColor White
Write-Host "1. .\run_backend.ps1 (in one PowerShell window)" -ForegroundColor White
Write-Host "2. .\run_frontend.ps1 (in another PowerShell window)" -ForegroundColor White
Write-Host "3. Open http://localhost:8501 in your browser" -ForegroundColor White
=======
# Test Setup Script for Kisan Call Centre
Write-Host "Testing Kisan Call Centre Setup..." -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if virtual environments exist
if (Test-Path "backend\venv") {
    Write-Host "✓ Backend virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "✗ Backend virtual environment missing. Run .\install.ps1 first" -ForegroundColor Red
}

if (Test-Path "frontend\venv") {
    Write-Host "✓ Frontend virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend virtual environment missing. Run .\install.ps1 first" -ForegroundColor Red
}

# Test backend imports
Write-Host "Testing backend imports..." -ForegroundColor Yellow
try {
    cd backend
    & "venv\Scripts\activate.ps1"
    python -c "from app.main import app; print('✓ Backend imports successful')"
    deactivate
    cd ..
} catch {
    Write-Host "✗ Backend import failed: $_" -ForegroundColor Red
    cd ..
}

# Test frontend imports
Write-Host "Testing frontend imports..." -ForegroundColor Yellow
try {
    cd frontend
    & "venv\Scripts\activate.ps1"
    python -c "import streamlit as st; print('✓ Frontend imports successful')"
    deactivate
    cd ..
} catch {
    Write-Host "✗ Frontend import failed: $_" -ForegroundColor Red
    cd ..
}

Write-Host "Setup test complete!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "If all checks passed, run:" -ForegroundColor White
Write-Host "1. .\run_backend.ps1 (in one PowerShell window)" -ForegroundColor White
Write-Host "2. .\run_frontend.ps1 (in another PowerShell window)" -ForegroundColor White
Write-Host "3. Open http://localhost:8501 in your browser" -ForegroundColor White
