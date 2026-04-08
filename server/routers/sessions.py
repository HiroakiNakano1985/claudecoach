"""Sessions router - CRUD endpoints for session data."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from server.database import get_db
from server.models.session import SessionMetadataIn, SessionMetadataOut

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/ingest")
def ingest_session(session: SessionMetadataIn):
    """Receive session metadata from the agent."""
    db = get_db()
    db.upsert_session(session.dict())
    return {"status": "ok", "session_id": session.session_id}


@router.get("", response_model=list[SessionMetadataOut])
def list_sessions(
    project: str | None = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    db = get_db()
    return db.list_sessions(project_name=project, limit=limit, offset=offset)


@router.get("/{session_id}", response_model=SessionMetadataOut)
def get_session(session_id: str):
    db = get_db()
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
