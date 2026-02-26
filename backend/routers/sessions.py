from fastapi import APIRouter, HTTPException, Depends
from typing import List

try:
    from backend.models.schemas import SessionCreateResponse, SessionListItem, SessionRenameRequest
    from backend.core.session_manager import session_manager
    from backend.core.persistence import persistence
    from backend.routers.auth import require_auth
except ImportError:
    from models.schemas import SessionCreateResponse, SessionListItem, SessionRenameRequest
    from core.session_manager import session_manager
    from core.persistence import persistence
    from routers.auth import require_auth

router = APIRouter()


@router.post("/sessions", response_model=SessionCreateResponse)
def create_session(user: dict = Depends(require_auth)):
    session_id = session_manager.create_session()
    session = session_manager.get_session(session_id)

    try:
        persistence.create_session(session_id, user_id=user["id"])
    except Exception:
        pass

    return SessionCreateResponse(session_id=session_id, created_at=session["created_at"])


@router.get("/sessions", response_model=List[SessionListItem])
def list_sessions(user: dict = Depends(require_auth)):
    persisted = persistence.get_all_sessions(user_id=user["id"])
    persisted.sort(key=lambda x: x.get("last_active", ""), reverse=True)
    return [SessionListItem(**sess) for sess in persisted]


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, user: dict = Depends(require_auth)):
    session_manager.delete_session(session_id)
    db_deleted = persistence.delete_session(session_id, user_id=user["id"])

    if not db_deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True}


@router.patch("/sessions/{session_id}")
def rename_session(session_id: str, request: SessionRenameRequest, user: dict = Depends(require_auth)):
    mem_session = session_manager.get_session(session_id)
    if mem_session:
        mem_session["title"] = request.title

    db_updated = persistence.rename_session(session_id, request.title, user_id=user["id"])

    if not db_updated and not mem_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"success": True, "session_id": session_id, "title": request.title}


@router.get("/sessions/{session_id}/messages")
def get_session_messages(session_id: str, user: dict = Depends(require_auth)):
    session = persistence.get_session(session_id, user_id=user["id"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    turns = persistence.get_turns(session_id)
    return {"session_id": session_id, "messages": turns}
