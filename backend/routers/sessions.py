from fastapi import APIRouter, HTTPException
from typing import List
from backend.models.schemas import SessionCreateResponse, SessionListItem
from backend.core.session_manager import session_manager

router = APIRouter()

@router.post("/sessions", response_model=SessionCreateResponse)
def create_session():
    session_id = session_manager.create_session()
    # Need to fetch created_at from the session object
    session = session_manager.get_session(session_id)
    return SessionCreateResponse(session_id=session_id, created_at=session["created_at"])

@router.get("/sessions", response_model=List[SessionListItem])
def list_sessions():
    sessions = session_manager.get_all_sessions()
    return [SessionListItem(**sess) for sess in sessions]

@router.delete("/sessions/{session_id}")
def delete_session(session_id: str):
    success = session_manager.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"deleted": True}
