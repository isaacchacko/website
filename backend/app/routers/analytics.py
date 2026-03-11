from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query, Request
from sqlmodel import select, func, col
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_session
from app.auth import get_admin_key
from app.models.analytics import (
    AnalyticsEvent,
    AnalyticsEventPublic,
    PageviewUpdate,
)
from math import ceil
from app.middleware.analytics import _parse_user_agent

router = APIRouter(prefix="/analytics", tags=["analytics"])


# ── Public endpoints ──────────────────────────────────────────────────────────


@router.post("/pageview")
async def log_pageview(
    body: PageviewUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    user_agent = request.headers.get("user-agent") or ""
    device_type, browser = _parse_user_agent(user_agent)

    event = AnalyticsEvent(
        path=body.path,
        referrer=request.headers.get("referer"),
        user_agent=user_agent,
        device_type=device_type,
        browser=browser,
        ip_address=request.client.host if request.client else "unknown",
        duration_seconds=body.duration_seconds,
    )
    session.add(event)
    await session.commit()
    return {"ok": True}


# ── Admin endpoints ───────────────────────────────────────────────────────────


@router.get("/summary")
async def get_summary(
    days: int = Query(default=7, ge=1, le=90),
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=days)

    # total views
    async def count_since(since: datetime) -> int:
        result = await session.execute(
            select(func.count(col(AnalyticsEvent.id))).where(
                AnalyticsEvent.created_at >= since
            )
        )
        return result.scalar() or 0

    total_today = await count_since(today_start)
    total_week = await count_since(week_start)
    total_all_time_result = await session.execute(
        select(func.count(col(AnalyticsEvent.id)))
    )
    total_all_time = total_all_time_result.scalar() or 0

    # top pages
    top_pages_result = await session.execute(
        select(AnalyticsEvent.path, func.count(col(AnalyticsEvent.id)).label("count"))
        .where(AnalyticsEvent.created_at >= week_start)
        .group_by(AnalyticsEvent.path)
        .order_by(text("count desc"))
        .limit(10)
    )
    top_pages = [{"path": row[0], "count": row[1]} for row in top_pages_result.all()]

    # top referrers
    top_referrers_result = await session.execute(
        select(
            AnalyticsEvent.referrer, func.count(col(AnalyticsEvent.id)).label("count")
        )
        .where(AnalyticsEvent.created_at >= week_start)
        .where(col(AnalyticsEvent.referrer).is_not(None))
        .group_by(AnalyticsEvent.referrer)
        .order_by(text("count desc"))
        .limit(10)
    )
    top_referrers = [
        {"referrer": row[0], "count": row[1]} for row in top_referrers_result.all()
    ]

    # device breakdown
    device_result = await session.execute(
        select(
            AnalyticsEvent.device_type,
            func.count(col(AnalyticsEvent.id)).label("count"),
        )
        .where(AnalyticsEvent.created_at >= week_start)
        .group_by(AnalyticsEvent.device_type)
        .order_by(text("count desc"))
    )
    device_breakdown = [
        {"device": row[0], "count": row[1]} for row in device_result.all()
    ]

    # browser breakdown
    browser_result = await session.execute(
        select(
            AnalyticsEvent.browser, func.count(col(AnalyticsEvent.id)).label("count")
        )
        .where(AnalyticsEvent.created_at >= week_start)
        .group_by(AnalyticsEvent.browser)
        .order_by(text("count desc"))
    )
    browser_breakdown = [
        {"browser": row[0], "count": row[1]} for row in browser_result.all()
    ]

    return {
        "total_views_today": total_today,
        "total_views_week": total_week,
        "total_views_all_time": total_all_time,
        "top_pages": top_pages,
        "top_referrers": top_referrers,
        "device_breakdown": device_breakdown,
        "browser_breakdown": browser_breakdown,
    }


@router.get("/events", response_model=dict)
async def list_events(
    page: int = 1,
    per_page: int = 50,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    per_page = min(per_page, 100)
    offset = (page - 1) * per_page

    total_result = await session.execute(select(func.count(col(AnalyticsEvent.id))))
    total = total_result.scalar() or 0

    result = await session.execute(
        select(AnalyticsEvent)
        .order_by(col(AnalyticsEvent.created_at).desc())
        .offset(offset)
        .limit(per_page)
    )
    events = list(result.scalars().all())

    return {
        "items": [AnalyticsEventPublic.model_validate(e) for e in events],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 1,
    }
