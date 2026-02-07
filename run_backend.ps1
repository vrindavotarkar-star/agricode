# Run Backend Server
Write-Host "Starting Kisan Call Centre Backend..." -ForegroundColor Green
cd backend
& "venv\Scripts\activate.ps1"
python app/main.py
