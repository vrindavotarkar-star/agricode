from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.auth import get_current_user
from app.models import User, QueryLog
from app.rag import rag_system
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    query: str
    offline_response: str
    ai_response: str = None

@router.post("/query", response_model=QueryResponse)
async def process_query(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Search offline knowledge base
        offline_results = rag_system.search_offline(request.query)
        offline_response = " ".join([result["document"] for result in offline_results])

        # Try to get AI response
        ai_response = rag_system.generate_ai_response(request.query, offline_results)

        # Log the query
        query_log = QueryLog(
            user_id=current_user.id,
            query=request.query,
            offline_response=offline_response,
            ai_response=ai_response
        )
        db.add(query_log)
        db.commit()

        return QueryResponse(
            query=request.query,
            offline_response=offline_response,
            ai_response=ai_response
        )

    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
