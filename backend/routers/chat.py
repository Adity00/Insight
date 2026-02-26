import json
from fastapi import APIRouter, HTTPException, Depends

try:
    from backend.models.schemas import ChatRequest, ChatResponse
    from backend.core.session_manager import session_manager
    from backend.core.query_pipeline import pipeline
    from backend.core.persistence import persistence
    from backend.routers.auth import require_auth
except ImportError:
    from models.schemas import ChatRequest, ChatResponse
    from core.session_manager import session_manager
    from core.query_pipeline import pipeline
    from core.persistence import persistence
    from routers.auth import require_auth

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(body: ChatRequest, user: dict = Depends(require_auth)):
    # Validation 1: Empty or too long question
    if not body.question or len(body.question) > 500:
        raise HTTPException(status_code=422, detail="Question must not be empty or longer than 500 characters.")

    # Validation 2: Session ownership — user can only chat in their own sessions
    db_session = persistence.get_session(body.session_id, user_id=user["id"])
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found. Create a session first via POST /sessions")

    # Validation 3: In-memory session existence (restore from DB if needed)
    session = session_manager.get_session(body.session_id)
    if not session:
        session_manager.sessions[body.session_id] = {
            "session_id": body.session_id,
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

    try:
        # Process via pipeline
        result = pipeline.process(body.question, body.session_id)

        # Persist user turn (fault-tolerant)
        try:
            persistence.save_turn(
                session_id=body.session_id,
                role="user",
                content=body.question
            )
        except Exception:
            pass

        # Persist assistant turn (fault-tolerant)
        try:
            persistence.save_turn(
                session_id=body.session_id,
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
            session_id=body.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Internal processing error", "detail": str(e)})
