from fastapi import APIRouter, HTTPException
from typing import List

try:
    from backend.models.schemas import SessionCreateResponse, SessionListItem, SessionRenameRequest
    from backend.core.session_manager import session_manager
    from backend.core.persistence import persistence
except ImportError:
    from models.schemas import SessionCreateResponse, SessionListItem, SessionRenameRequest
    from core.session_manager import session_manager
    from core.persistence import persistence

router = APIRouter()


@router.post("/sessions", response_model=SessionCreateResponse)
def create_session():
    # Create in-memory session (for pipeline context tracking)
    session_id = session_manager.create_session()
    session = session_manager.get_session(session_id)

    # Persist to SQLite (fault-tolerant)
    try:
        persistence.create_session(session_id)
    except Exception:
        pass  # Never crash — in-memory still works

    return SessionCreateResponse(session_id=session_id, created_at=session["created_at"])


@router.get("/sessions", response_model=List[SessionListItem])
def list_sessions():
    # Merge: prefer SQLite for persisted sessions, fallback to in-memory
    persisted = persistence.get_all_sessions()
    in_memory = session_manager.get_all_sessions()

    # Build a combined list — SQLite is source of truth for persisted,
    # in-memory catches any that haven't been persisted yet
    seen_ids = set()
    combined = []

    for sess in persisted:
        seen_ids.add(sess["session_id"])
        combined.append(sess)

    for sess in in_memory:
        if sess["session_id"] not in seen_ids:
            combined.append(sess)

    # Sort by last_active descending
    combined.sort(key=lambda x: x.get("last_active", ""), reverse=True)

    return [SessionListItem(**sess) for sess in combined]


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str):
    # Delete from both stores
    mem_deleted = session_manager.delete_session(session_id)
    db_deleted = persistence.delete_session(session_id)

    if not mem_deleted and not db_deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True}

@router.patch("/sessions/{session_id}")
def rename_session(session_id: str, request: SessionRenameRequest):
    # Rename in both stores
    
    # 1. Update in memory if exists
    mem_session = session_manager.get_session(session_id)
    mem_updated = False
    if mem_session:
        mem_session["title"] = request.title
        mem_updated = True
        
    # 2. Update in DB if exists
    db_updated = persistence.rename_session(session_id, request.title)
    
    if not mem_updated and not db_updated:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return {"success": True, "session_id": session_id, "title": request.title}



@router.get("/sessions/{session_id}/messages")
def get_session_messages(session_id: str):
    """
    Returns full turn history from SQLite for session restoration.
    """
    turns = persistence.get_turns(session_id)
    return {"session_id": session_id, "messages": turns}
