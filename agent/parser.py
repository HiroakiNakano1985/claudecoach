"""
parser.py - Claude Code JSONL log parser.

Extracts session metadata from ~/.claude/projects/**/*.jsonl
without storing any actual conversation content.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator

logger = logging.getLogger(__name__)

DEFAULT_PROJECTS_PATH = Path.home() / ".claude" / "projects"


@dataclass
class SessionMetadata:
    session_id: str
    timestamp: str
    project_name: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_creation_tokens: int = 0
    tool_calls: int = 0
    message_count: int = 0
    session_duration_minutes: float = 0.0
    prompt_lengths: list[int] = field(default_factory=list)
    long_prompt_count: int = 0
    clarification_count: int = 0
    model_switches: int = 0


LONG_PROMPT_THRESHOLD = 500  # characters


def _extract_project_name(project_dir: Path) -> str:
    """Derive a human-readable project name from the directory name.

    Claude stores projects under names like:
      c--python-my-portfolio-claudecoach  ->  my-portfolio/claudecoach
      C--python-prototyping-BCN-flight    ->  prototyping/BCN-flight
    """
    name = project_dir.name
    # Strip leading drive-letter prefix (e.g. "c--" or "C--")
    if len(name) > 2 and name[1:3] == "--":
        name = name[3:]
    # Remove common prefix like "python-"
    for prefix in ("python-", "node-", "go-"):
        if name.startswith(prefix):
            name = name[len(prefix):]
            break
    return name


def parse_jsonl_file(jsonl_path: Path, project_name: str) -> SessionMetadata | None:
    """Parse a single .jsonl session file and return aggregated metadata."""
    session_id = jsonl_path.stem
    timestamps: list[datetime] = []
    models_seen: list[str] = []
    last_model: str | None = None
    meta = SessionMetadata(
        session_id=session_id,
        timestamp="",
        project_name=project_name,
        model="",
    )

    try:
        with jsonl_path.open(encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    logger.warning("Skipping invalid JSON at %s:%d", jsonl_path, line_num)
                    continue
                _process_entry(entry, meta, timestamps, models_seen)
    except OSError as e:
        logger.error("Failed to read %s: %s", jsonl_path, e)
        return None

    if not timestamps:
        return None

    # Finalize metadata
    timestamps.sort()
    meta.timestamp = timestamps[0].isoformat()
    duration = (timestamps[-1] - timestamps[0]).total_seconds()
    meta.session_duration_minutes = round(duration / 60, 1)

    # Most-used model
    if models_seen:
        meta.model = max(set(models_seen), key=models_seen.count)

    # Model switches
    meta.model_switches = sum(
        1 for i in range(1, len(models_seen)) if models_seen[i] != models_seen[i - 1]
    )

    # Long prompts
    meta.long_prompt_count = sum(
        1 for length in meta.prompt_lengths if length >= LONG_PROMPT_THRESHOLD
    )

    return meta


def _process_entry(
    entry: dict,
    meta: SessionMetadata,
    timestamps: list[datetime],
    models_seen: list[str],
) -> None:
    """Process a single JSONL entry and accumulate into metadata."""
    ts_str = entry.get("timestamp")
    if ts_str:
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            timestamps.append(ts)
        except ValueError:
            pass

    entry_type = entry.get("type")

    if entry_type == "user":
        meta.message_count += 1
        content = entry.get("message", {}).get("content", [])
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                text = block.get("text", "")
                meta.prompt_lengths.append(len(text))

    elif entry_type == "assistant":
        message = entry.get("message", {})

        # Extract usage from message
        usage = message.get("usage", {})
        if usage:
            meta.input_tokens += usage.get("input_tokens", 0)
            meta.output_tokens += usage.get("output_tokens", 0)
            meta.cache_read_tokens += usage.get("cache_read_input_tokens", 0)
            meta.cache_creation_tokens += usage.get("cache_creation_input_tokens", 0)

        # Track model
        model = message.get("model")
        if model:
            models_seen.append(model)

        # Count tool calls in content
        for block in message.get("content", []):
            if isinstance(block, dict) and block.get("type") == "tool_use":
                meta.tool_calls += 1

        # Heuristic: if stop_reason is "tool_use" with certain tools,
        # it might indicate a clarification exchange
        # (simplified: count user messages that follow quickly)


def _is_clarification(entry: dict) -> bool:
    """Heuristic: short user messages (<50 chars) after a question are likely clarifications."""
    content = entry.get("message", {}).get("content", [])
    for block in content:
        if isinstance(block, dict) and block.get("type") == "text":
            text = block.get("text", "")
            if len(text) < 50:
                return True
    return False


def scan_projects_dir(
    projects_path: Path | None = None,
) -> Iterator[SessionMetadata]:
    """Scan all project directories and yield SessionMetadata for each session."""
    root = projects_path or DEFAULT_PROJECTS_PATH
    if not root.exists():
        logger.warning("Projects directory not found: %s", root)
        return

    for project_dir in sorted(root.iterdir()):
        if not project_dir.is_dir():
            continue
        project_name = _extract_project_name(project_dir)
        for jsonl_file in sorted(project_dir.glob("*.jsonl")):
            meta = parse_jsonl_file(jsonl_file, project_name)
            if meta is not None:
                yield meta


def parse_all(projects_path: Path | None = None) -> list[SessionMetadata]:
    """Parse all sessions and return as a list."""
    return list(scan_projects_dir(projects_path))


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    for session in parse_all():
        print(
            f"{session.project_name:40s} "
            f"tokens={session.input_tokens + session.output_tokens:>8,} "
            f"tools={session.tool_calls:>3} "
            f"msgs={session.message_count:>3} "
            f"duration={session.session_duration_minutes:.0f}min "
            f"model={session.model}"
        )
