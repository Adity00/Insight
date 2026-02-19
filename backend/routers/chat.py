from fastapi import APIRouter, HTTPException
from backend.models.schemas import ChatRequest, ChatResponse
from backend.core.session_manager import session_manager
from backend.core.query_pipeline import pipeline

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    # Validation 1: Empty or too long question
    if not request.question or len(request.question) > 500:
        raise HTTPException(status_code=422, detail="Question must not be empty or longer than 500 characters.")
    
    # Validation 2: Session existence
    session = session_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Create a session first via POST /sessions")
    
    try:
        # Process via pipeline
        result = pipeline.process(request.question, request.session_id)
        
        return ChatResponse(
            answer=result["answer"],
            sql_used=result.get("sql_used"),
            chart=result.get("chart"),
            proactive_insight=result.get("proactive_insight"),
            query_intent=result.get("query_intent"),
            execution_time_ms=result.get("execution_time_ms"),
            is_clarification=result.get("is_clarification", False),
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Internal processing error", "detail": str(e)})
