from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, query
from app.database import engine, Base
from app.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kisan Call Centre Query Assistant",
    description="AI-powered agricultural advisory system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8501"],  # React and Streamlit ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(query.router, prefix="/api", tags=["Query"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Kisan Call Centre API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
