"""
ClaudeCoach FastAPI server.

Serves dashboard data, session metadata, and analysis results.
"""

from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.database import get_db
from server.routers import analysis, sessions

app = FastAPI(
    title="ClaudeCoach",
    description="Claude Code usage analytics and optimization",
    version="0.1.0",
)

# Allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)
app.include_router(analysis.router)


@app.on_event("startup")
def startup():
    """Initialize database on startup."""
    get_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}
