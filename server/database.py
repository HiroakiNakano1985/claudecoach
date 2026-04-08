"""
database.py - JSON file-based database for ClaudeCoach.

Uses a simple JSON file store instead of SQLite for maximum compatibility.
Stores session metadata and analysis results.
No conversation content is ever persisted.

Note: SQLite is the intended backend per the design doc, but this JSON-based
implementation works around sqlite3 segfault issues in certain Anaconda
environments. The interface is designed so it can be swapped to SQLite later.
"""

from __future__ import annotations

import json
import threading
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "claudecoach_data.json"


def _empty_store() -> dict:
    return {"sessions": {}, "analyses": []}


class Database:
    def __init__(self, db_path: Path | str | None = None):
        self.db_path = Path(db_path) if db_path else DEFAULT_DB_PATH
        self._lock = threading.Lock()
        self._store = self._load()

    def _load(self) -> dict:
        if self.db_path.exists():
            try:
                return json.loads(self.db_path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                return _empty_store()
        return _empty_store()

    def _save(self) -> None:
        self.db_path.write_text(
            json.dumps(self._store, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    # ── Session CRUD ──

    def upsert_session(self, session: dict[str, Any]) -> None:
        with self._lock:
            sid = session["session_id"]
            now = datetime.utcnow().isoformat()
            record = {
                **session,
                "prompt_lengths": session.get("prompt_lengths", []),
                "updated_at": now,
            }
            if sid not in self._store["sessions"]:
                record["created_at"] = now
            else:
                record["created_at"] = self._store["sessions"][sid].get("created_at", now)
            self._store["sessions"][sid] = record
            self._save()

    def get_session(self, session_id: str) -> dict[str, Any] | None:
        return self._store["sessions"].get(session_id)

    def list_sessions(
        self,
        project_name: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        sessions = list(self._store["sessions"].values())
        if project_name:
            sessions = [s for s in sessions if s["project_name"] == project_name]
        sessions.sort(key=lambda s: s.get("timestamp", ""), reverse=True)
        return sessions[offset : offset + limit]

    def get_all_sessions(self) -> list[dict[str, Any]]:
        sessions = list(self._store["sessions"].values())
        sessions.sort(key=lambda s: s.get("timestamp", ""), reverse=True)
        return sessions

    # ── Aggregations ──

    def _recent_sessions(self, days: int = 30) -> list[dict[str, Any]]:
        cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
        return [
            s for s in self._store["sessions"].values()
            if s.get("timestamp", "") >= cutoff
        ]

    def get_dashboard_summary(self) -> dict[str, Any]:
        sessions = self._recent_sessions(30)
        return {
            "session_count": len(sessions),
            "total_input": sum(s.get("input_tokens", 0) for s in sessions),
            "total_output": sum(s.get("output_tokens", 0) for s in sessions),
            "total_cache_read": sum(s.get("cache_read_tokens", 0) for s in sessions),
            "total_cache_creation": sum(s.get("cache_creation_tokens", 0) for s in sessions),
            "total_tool_calls": sum(s.get("tool_calls", 0) for s in sessions),
            "total_messages": sum(s.get("message_count", 0) for s in sessions),
            "total_long_prompts": sum(s.get("long_prompt_count", 0) for s in sessions),
            "total_clarifications": sum(s.get("clarification_count", 0) for s in sessions),
        }

    def get_project_breakdown(self) -> list[dict[str, Any]]:
        sessions = self._recent_sessions(30)
        projects: dict[str, dict] = {}
        for s in sessions:
            name = s["project_name"]
            if name not in projects:
                projects[name] = {
                    "project_name": name,
                    "session_count": 0,
                    "total_input": 0,
                    "total_output": 0,
                    "total_cache_read": 0,
                }
            p = projects[name]
            p["session_count"] += 1
            p["total_input"] += s.get("input_tokens", 0)
            p["total_output"] += s.get("output_tokens", 0)
            p["total_cache_read"] += s.get("cache_read_tokens", 0)

        result = list(projects.values())
        result.sort(key=lambda p: p["total_input"] + p["total_output"], reverse=True)
        return result

    def get_weekly_tokens(self, weeks: int = 8) -> list[dict[str, Any]]:
        cutoff = (datetime.utcnow() - timedelta(weeks=weeks)).isoformat()
        sessions = [
            s for s in self._store["sessions"].values()
            if s.get("timestamp", "") >= cutoff
        ]

        weekly: dict[str, dict] = {}
        for s in sessions:
            ts = s.get("timestamp", "")
            if not ts:
                continue
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                week_key = f"{dt.isocalendar()[0]}-W{dt.isocalendar()[1]:02d}"
            except ValueError:
                continue
            if week_key not in weekly:
                weekly[week_key] = {
                    "week": week_key,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "cache_read_tokens": 0,
                    "session_count": 0,
                }
            w = weekly[week_key]
            w["input_tokens"] += s.get("input_tokens", 0)
            w["output_tokens"] += s.get("output_tokens", 0)
            w["cache_read_tokens"] += s.get("cache_read_tokens", 0)
            w["session_count"] += 1

        return sorted(weekly.values(), key=lambda w: w["week"])

    def get_sessions_last_n_days(self, days: int = 8) -> list[dict[str, Any]]:
        return self._recent_sessions(days)

    # ── Analysis CRUD ──

    def upsert_analysis(self, analysis: dict[str, Any]) -> None:
        with self._lock:
            analyses = self._store["analyses"]
            # Find existing by (period, period_start)
            for i, a in enumerate(analyses):
                if a["period"] == analysis["period"] and a["period_start"] == analysis["period_start"]:
                    analyses[i] = {**analysis, "created_at": a.get("created_at", datetime.utcnow().isoformat())}
                    self._save()
                    return
            analysis["created_at"] = datetime.utcnow().isoformat()
            analyses.append(analysis)
            self._save()

    def get_latest_analysis(self, period: str = "monthly") -> dict[str, Any] | None:
        matching = [a for a in self._store["analyses"] if a.get("period") == period]
        if not matching:
            return None
        matching.sort(key=lambda a: a.get("period_start", ""), reverse=True)
        return matching[0]


# Singleton for convenience
_db: Database | None = None


def get_db(db_path: Path | str | None = None) -> Database:
    global _db
    if _db is None:
        _db = Database(db_path)
    return _db
