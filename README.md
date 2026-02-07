# Kisan Call Centre Query Assistant

A production-ready full-stack AI-powered agricultural advisory system built with FastAPI backend and Streamlit frontend.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Agricultural Query Processing**: RAG pipeline combining offline FAISS search with online AI responses
- **Database Support**: SQLite/PostgreSQL with SQLAlchemy ORM
- **Offline Capability**: Works without internet for basic queries
- **Modern UI**: Streamlit-based responsive interface
- **Production Ready**: Structured logging, error handling, and configuration management

## Project Structure

```
kisan-call-centre/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── config.py        # Configuration settings
│   │   ├── database.py      # Database connection
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── auth.py          # Authentication utilities
│   │   ├── rag.py           # RAG pipeline implementation
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py      # Authentication endpoints
│   │       └── query.py     # Query processing endpoints
│   ├── requirements.txt
│   └── .env                 # Environment variables
├── frontend/
│   ├── app.py               # Streamlit application
│   └── requirements.txt
└── docs/
    └── README.md
```

## Installation & Setup

### Prerequisites

- Python 3.8+
- Windows PowerShell 5+

### Backend Setup

1. Navigate to backend directory:
   ```powershell
   cd kisan-call-centre\backend
   ```

2. Create virtual environment:
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```
   DATABASE_URL=sqlite:///./kisan_call_centre.db
   SECRET_KEY=your-secret-key-here-change-in-production
   WATSONX_API_KEY=your-watsonx-api-key
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   WATSONX_PROJECT_ID=your-project-id
   ```

5. Run database migrations:
   ```powershell
   python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"
   ```

6. Start the backend server:
   ```powershell
   python app/main.py
   ```

### Frontend Setup

1. Open a new PowerShell window and navigate to frontend directory:
   ```powershell
   cd kisan-call-centre\frontend
   ```

2. Create virtual environment:
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Start the Streamlit app:
   ```powershell
   streamlit run app.py
   ```

## API Documentation

### Authentication Endpoints

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "farmer123",
  "email": "farmer@example.com",
  "mobile_number": "9876543210",
  "password": "securepassword",
  "location": "Maharashtra",
  "crop_type": "Rice",
  "category": "small_farmer"
}
```

#### POST /auth/login
Login and get access token.

**Request Body:**
```
username=farmer123&password=securepassword
```

### Query Endpoints

#### POST /api/query
Process agricultural query (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "query": "How to control pests in rice crop?"
}
```

**Response:**
```json
{
  "query": "How to control pests in rice crop?",
  "offline_response": "Pests like aphids can be controlled with neem oil...",
  "ai_response": "Based on your query about pest control in rice crops..."
}
```

#### GET /health
Health check endpoint.

## Database Schema

### Users Table
- id: Primary key
- username: Unique username
- email: Unique email address
- mobile_number: Mobile number
- password_hash: Bcrypt hashed password
- location: Optional location
- crop_type: Optional crop type
- category: Farmer category (small_farmer/large_farmer)
- created_at: Timestamp

### Query Logs Table
- id: Primary key
- user_id: Foreign key to users
- query: User's query text
- offline_response: Response from knowledge base
- ai_response: AI-generated response (nullable)
- created_at: Timestamp

## Configuration

### Environment Variables

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `WATSONX_API_KEY`: IBM Watsonx API key
- `WATSONX_URL`: Watsonx service URL
- `WATSONX_PROJECT_ID`: Watsonx project ID

## Usage

1. Start the backend server
2. Start the frontend application
3. Register a new account or login
4. Enter agricultural queries in the text area
5. View both offline knowledge base and AI-generated responses

## Deployment

### Local Development
- Backend runs on http://localhost:8000
- Frontend runs on http://localhost:8501
- API documentation available at http://localhost:8000/docs

### Production Deployment
- Use a production WSGI server like Gunicorn for backend
- Configure proper database (PostgreSQL recommended)
- Set secure SECRET_KEY and API keys
- Enable HTTPS
- Configure proper CORS origins

## Future Extensions

- Voice input support
- Farmer feedback learning system
- Cloud deployment (AWS/Azure/GCP)
- Multilingual support
- Mobile app development
- Advanced analytics dashboard

## License

This project is licensed under the MIT License.
