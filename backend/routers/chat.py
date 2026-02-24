import json
from fastapi import APIRouter, HTTPException

try:
    from backend.models.schemas import ChatRequest, ChatResponse
    from backend.core.session_manager import session_manager
    from backend.core.query_pipeline import pipeline
    from backend.core.persistence import persistence
except ImportError:
    from models.schemas import ChatRequest, ChatResponse
    from core.session_manager import session_manager
    from core.query_pipeline import pipeline
    from core.persistence import persistence

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    # Validation 1: Empty or too long question
    if not request.question or len(request.question) > 500:
        raise HTTPException(status_code=422, detail="Question must not be empty or longer than 500 characters.")

    # Validation 2: Session existence (in-memory)
    session = session_manager.get_session(request.session_id)
    if not session:
        # Try to restore from SQLite if it exists there
        db_session = persistence.get_session(request.session_id)
        if db_session:
            # Re-create in-memory session so pipeline works
            session_manager.sessions[request.session_id] = {
                "session_id": request.session_id,
                "title": db_session.get("title", "New Chat"),
                "created_at": db_session.get("created_at", ""),
                "last_active": db_session.get("last_active", ""),
                "turns": [],
                "entity_tracker": {
                    "states": [],
                    "transaction_types": [],
                    "age_groups": [],
                    "time_filters": {},
                    "metric": "",
                    "last_hour": None,
                    "last_category": None
                },
                "summary": ""
            }
        else:
            raise HTTPException(status_code=404, detail="Session not found. Create a session first via POST /sessions")

    try:
        # Process via pipeline
        result = pipeline.process(request.question, request.session_id)

        # Persist user turn (fault-tolerant)
        try:
            persistence.save_turn(
                session_id=request.session_id,
                role="user",
                content=request.question
            )
        except Exception:
            pass

        # Persist assistant turn (fault-tolerant)
        try:
            persistence.save_turn(
                session_id=request.session_id,
                role="assistant",
                content=result.get("answer", ""),
                sql_used=result.get("sql_used"),
                execution_time_ms=result.get("execution_time_ms"),
                chart=result.get("chart")
            )
        except Exception:
            pass

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
