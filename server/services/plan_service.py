"""
plan_service.py - Plan auto-detection and ROI calculation.

Detects which Claude plan the user is on based on token consumption
patterns in 5-hour windows, and calculates ROI vs API pricing.

NOTE: ROI is an *estimate* based on API pay-as-you-go pricing.
Max plan usage limits may weight token types differently from API billing.
In particular, cache_read_input_tokens do NOT count toward API ITPM rate
limits for current models (Opus 4.x, Sonnet 4.x, Haiku 4.5), so the
actual "value" of cached tokens on a Max plan may differ from this estimate.
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta
from typing import Any


# Plan cost table
PLAN_COSTS = {
    "pro": 20.0,
    "max_5x": 100.0,
    "max_20x": 200.0,
    "api": None,
}

# API pricing (per token)
INPUT_TOKEN_PRICE = 0.000003   # $3 / 1M tokens
OUTPUT_TOKEN_PRICE = 0.000015  # $15 / 1M tokens
CACHE_READ_PRICE = 0.0000003  # $0.30 / 1M tokens
CACHE_WRITE_PRICE = 0.00000375  # $3.75 / 1M tokens


def get_max_5h_window_tokens(sessions: list[dict[str, Any]]) -> int:
    """Find the maximum total tokens consumed in any 5-hour sliding window."""
    # Build a list of (timestamp, total_tokens) pairs
    events: list[tuple[datetime, int]] = []
    for s in sessions:
        ts_str = s.get("timestamp", "")
        if not ts_str:
            continue
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        except ValueError:
            continue
        total = s.get("input_tokens", 0) + s.get("output_tokens", 0)
        events.append((ts, total))

    if not events:
        return 0

    events.sort(key=lambda e: e[0])
    window = timedelta(hours=5)
    max_tokens = 0

    for i, (start_ts, _) in enumerate(events):
        window_end = start_ts + window
        window_tokens = sum(
            tokens for ts, tokens in events[i:]
            if ts <= window_end
        )
        max_tokens = max(max_tokens, window_tokens)

    return max_tokens


def detect_plan(sessions: list[dict[str, Any]]) -> str:
    """
    Auto-detect the user's plan from the last 8 days of sessions.
    Looks at the peak 5-hour window token consumption.
    """
    # Check manual override first
    manual = os.environ.get("CLAUDE_PLAN", "auto").lower()
    if manual != "auto" and manual in PLAN_COSTS:
        return manual

    max_window = get_max_5h_window_tokens(sessions)

    if max_window < 50_000:
        return "pro"
    elif max_window < 100_000:
        return "max_5x"
    elif max_window < 250_000:
        return "max_20x"
    else:
        return "api"


def calc_api_equivalent_cost(
    input_tokens: int,
    output_tokens: int,
    cache_read_tokens: int = 0,
    cache_creation_tokens: int = 0,
) -> float:
    """
    Estimate what the same usage would cost on the API (pay-as-you-go).

    This is a rough estimate — Max plan usage limits may not weight
    token types identically to API billing. cache_read tokens are
    charged at 10% of standard input price on the API, and do NOT
    count toward ITPM rate limits for current models.
    """
    return (
        input_tokens * INPUT_TOKEN_PRICE
        + output_tokens * OUTPUT_TOKEN_PRICE
        + cache_read_tokens * CACHE_READ_PRICE
        + cache_creation_tokens * CACHE_WRITE_PRICE
    )


def calc_roi(plan: str, api_equivalent_cost: float, lang: str = "ja") -> dict[str, Any]:
    """Calculate ROI for the detected plan."""
    cost = PLAN_COSTS.get(plan)
    if cost is None:
        msg = "APIプランはROI計算対象外" if lang == "ja" else "ROI not applicable for API plan"
        return {
            "plan": "api",
            "plan_cost": None,
            "api_equivalent": api_equivalent_cost,
            "roi_ratio": None,
            "is_profitable": None,
            "message": msg,
        }

    roi = api_equivalent_cost / cost if cost > 0 else 0.0
    is_profitable = roi >= 1.0

    plan_labels_ja = {"pro": "Pro", "max_5x": "MAX 5x", "max_20x": "MAX 20x"}
    plan_label = plan_labels_ja.get(plan, plan)

    if is_profitable:
        message = (
            f"{plan_label}プランの{roi:.1f}倍の元を取っています" if lang == "ja"
            else f"Getting {roi:.1f}x return on your {plan_label} plan"
        )
    else:
        remaining = cost - api_equivalent_cost
        message = (
            f"あと${remaining:.2f}分使うと元が取れます" if lang == "ja"
            else f"Use ${remaining:.2f} more to break even"
        )

    return {
        "plan": plan,
        "plan_cost": cost,
        "api_equivalent": round(api_equivalent_cost, 2),
        "roi_ratio": round(roi, 2),
        "is_profitable": is_profitable,
        "message": message,
    }


def get_plan_and_roi(
    recent_sessions: list[dict[str, Any]],
    monthly_sessions: list[dict[str, Any]] | None = None,
    lang: str = "ja",
) -> dict[str, Any]:
    """
    Detect plan from recent_sessions (last 8 days),
    calculate ROI from monthly_sessions (last 30 days).
    If monthly_sessions is None, uses recent_sessions for both.
    """
    plan = detect_plan(recent_sessions)
    billing_sessions = monthly_sessions if monthly_sessions is not None else recent_sessions

    total_input = sum(s.get("input_tokens", 0) for s in billing_sessions)
    total_output = sum(s.get("output_tokens", 0) for s in billing_sessions)
    total_cache_read = sum(s.get("cache_read_tokens", 0) for s in billing_sessions)
    total_cache_creation = sum(s.get("cache_creation_tokens", 0) for s in billing_sessions)

    api_cost = calc_api_equivalent_cost(
        total_input, total_output, total_cache_read, total_cache_creation,
    )

    roi = calc_roi(plan, api_cost, lang=lang)
    return roi
