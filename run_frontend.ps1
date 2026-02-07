# Run Frontend Application
Write-Host "Starting Kisan Call Centre Frontend..." -ForegroundColor Green
cd frontend
& "venv\Scripts\activate.ps1"
streamlit run app.py
