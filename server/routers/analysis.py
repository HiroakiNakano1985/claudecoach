"""Analysis router - dashboard, ROI, and plan detection endpoints."""

from __future__ import annotations

import os

from fastapi import APIRouter, Query

from server.database import get_db
from server.models.analysis import PlanInfo
from server.models.session import (
    DashboardSummary,
    ProjectBreakdown,
    ROIInfo,
    WeeklyTokens,
)
from server.services.plan_service import (
    PLAN_COSTS,
    calc_api_equivalent_cost,
    calc_roi,
    detect_plan,
    get_max_5h_window_tokens,
    get_plan_and_roi,
)

router = APIRouter(prefix="/api", tags=["analysis"])


@router.get("/dashboard", response_model=DashboardSummary)
def get_dashboard(plan: str | None = Query(None), lang: str = Query("ja")):
    """Dashboard summary with ROI, project breakdown, and weekly trend."""
    db = get_db()

    summary = db.get_dashboard_summary()
    recent_8d = db.get_sessions_last_n_days(8)
    monthly = db.get_sessions_last_n_days(30)

    # ROI - use UI-selected plan if provided, otherwise auto-detect
    if plan and plan in PLAN_COSTS:
        total_input = sum(s.get("input_tokens", 0) for s in monthly)
        total_output = sum(s.get("output_tokens", 0) for s in monthly)
        total_cache_read = sum(s.get("cache_read_tokens", 0) for s in monthly)
        total_cache_creation = sum(s.get("cache_creation_tokens", 0) for s in monthly)
        api_cost_for_roi = calc_api_equivalent_cost(
            total_input, total_output, total_cache_read, total_cache_creation,
        )
        roi_data = calc_roi(plan, api_cost_for_roi, lang=lang)
    else:
        roi_data = get_plan_and_roi(recent_8d, monthly, lang=lang)
    roi = ROIInfo(**roi_data)

    # API equivalent cost for all monthly sessions
    api_cost = calc_api_equivalent_cost(
        summary["total_input"],
        summary["total_output"],
        summary["total_cache_read"],
        summary.get("total_cache_creation", 0),
    )

    # Project breakdown with per-project cost
    projects_raw = db.get_project_breakdown()
    projects = []
    for p in projects_raw:
        cost = calc_api_equivalent_cost(p["total_input"], p["total_output"], p["total_cache_read"])
        projects.append(ProjectBreakdown(
            **p,
            api_equivalent_cost=round(cost, 2),
        ))

    # Sort projects by cost descending
    projects.sort(key=lambda p: p.api_equivalent_cost, reverse=True)

    # Weekly tokens
    weekly_raw = db.get_weekly_tokens(8)
    weekly = [WeeklyTokens(**w) for w in weekly_raw]

    return DashboardSummary(
        **summary,
        api_equivalent_cost=round(api_cost, 2),
        plan=roi.plan,
        roi=roi,
        projects=projects,
        weekly_tokens=weekly,
    )


@router.get("/roi", response_model=ROIInfo)
def get_roi():
    """Calculate ROI for the detected plan."""
    db = get_db()
    recent_8d = db.get_sessions_last_n_days(8)
    monthly = db.get_sessions_last_n_days(30)
    roi_data = get_plan_and_roi(recent_8d, monthly)
    return ROIInfo(**roi_data)


@router.get("/plan", response_model=PlanInfo)
def get_plan():
    """Return plan auto-detection result."""
    db = get_db()
    recent = db.get_sessions_last_n_days(8)
    plan = detect_plan(recent)
    max_5h = get_max_5h_window_tokens(recent)
    manual = os.environ.get("CLAUDE_PLAN", "auto").lower()

    return PlanInfo(
        detected_plan=plan,
        manual_override=manual if manual != "auto" else None,
        max_5h_window_tokens=max_5h,
    )
