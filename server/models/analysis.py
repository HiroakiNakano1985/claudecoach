"""Pydantic models for analysis data."""

from __future__ import annotations

from pydantic import BaseModel


class PlanInfo(BaseModel):
    detected_plan: str
    manual_override: str | None = None
    max_5h_window_tokens: int = 0


class AnalysisResult(BaseModel):
    period: str
    period_start: str
    period_end: str
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    total_cache_read: int = 0
    api_equivalent_cost: float = 0.0
    cache_hit_rate: float = 0.0
    long_prompt_ratio: float = 0.0
    clarification_ratio: float = 0.0
    detected_plan: str = "auto"
    roi_ratio: float = 0.0
    session_count: int = 0
