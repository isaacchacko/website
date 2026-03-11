from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class AnalyticsEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    path: str
    referrer: Optional[str] = Field(default=None)
    user_agent: Optional[str] = Field(default=None)
    device_type: Optional[str] = Field(default=None)  # desktop, mobile, tablet
    browser: Optional[str] = Field(default=None)  # Chrome, Firefox, Safari, etc.
    country: Optional[str] = Field(default=None)  # TODO: not implemented
    ip_address: str
    duration_seconds: Optional[int] = Field(default=None)  # TODO: not implemented
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AnalyticsEventPublic(SQLModel):
    id: int
    path: str
    referrer: Optional[str]
    device_type: Optional[str]
    browser: Optional[str]
    country: Optional[str]
    duration_seconds: Optional[int]
    created_at: datetime
    ip_address: str


class AnalyticsSummary(SQLModel):
    total_views_today: int
    total_views_week: int
    total_views_all_time: int
    top_pages: list[dict]
    top_referrers: list[dict]
    device_breakdown: list[dict]
    browser_breakdown: list[dict]


class PageviewUpdate(SQLModel):
    path: str
    duration_seconds: int | None = None
