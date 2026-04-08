"""Pydantic models for session data."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SessionMetadataIn(BaseModel):
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
    prompt_lengths: list[int] = Field(default_factory=list)
    long_prompt_count: int = 0
    clarification_count: int = 0
    model_switches: int = 0


class SessionMetadataOut(SessionMetadataIn):
    created_at: str | None = None
    updated_at: str | None = None


class DashboardSummary(BaseModel):
    session_count: int = 0
    total_input: int = 0
    total_output: int = 0
    total_cache_read: int = 0
    total_cache_creation: int = 0
    total_tool_calls: int = 0
    total_messages: int = 0
    total_long_prompts: int = 0
    total_clarifications: int = 0
    api_equivalent_cost: float = 0.0
    plan: str = "auto"
    roi: ROIInfo | None = None
    projects: list[ProjectBreakdown] = Field(default_factory=list)
    weekly_tokens: list[WeeklyTokens] = Field(default_factory=list)


class ROIInfo(BaseModel):
    plan: str
    plan_cost: float | None = None
    api_equivalent: float = 0.0
    roi_ratio: float | None = None
    is_profitable: bool | None = None
    message: str = ""


class ProjectBreakdown(BaseModel):
    project_name: str
    session_count: int = 0
    total_input: int = 0
    total_output: int = 0
    total_cache_read: int = 0
    api_equivalent_cost: float = 0.0


class WeeklyTokens(BaseModel):
    week: str
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    session_count: int = 0


# Forward reference update
DashboardSummary.model_rebuild()
