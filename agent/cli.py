"""
cli.py - ClaudeCoach CLI commands.

Usage:
    python -m agent.cli ingest       # Parse all JSONL and load into DB
    python -m agent.cli ingest --path /custom/path
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from agent.parser import parse_all, DEFAULT_PROJECTS_PATH
from server.database import get_db


def cmd_ingest(args: argparse.Namespace) -> None:
    """Parse all Claude Code JSONL logs and ingest into the database."""
    projects_path = Path(args.path) if args.path else DEFAULT_PROJECTS_PATH
    print(f"Scanning: {projects_path}")

    db = get_db()
    sessions = parse_all(projects_path)
    print(f"Found {len(sessions)} sessions")

    for s in sessions:
        db.upsert_session(s.__dict__)
        print(f"  OK {s.project_name:40s} tokens={s.input_tokens + s.output_tokens:>8,}")

    print(f"\nIngested {len(sessions)} sessions into {db.db_path}")


def main() -> None:
    parser = argparse.ArgumentParser(prog="claudecoach", description="ClaudeCoach CLI")
    sub = parser.add_subparsers(dest="command")

    ingest_parser = sub.add_parser("ingest", help="Ingest JSONL logs into database")
    ingest_parser.add_argument("--path", type=str, default=None, help="Custom projects path")

    args = parser.parse_args()
    if args.command == "ingest":
        cmd_ingest(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
