from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, col
from app.database import AsyncSessionLocal
from app.models.analytics import AnalyticsEvent
from app.config import settings


SKIP_PATHS = {"/docs", "/openapi.json", "/health", "/redoc"}


def _parse_user_agent(ua: str) -> tuple[str, str]:
    """Returns (device_type, browser)"""
    ua = ua.lower()

    if "mobile" in ua or "android" in ua:
        device_type = "mobile"
    elif "tablet" in ua or "ipad" in ua:
        device_type = "tablet"
    else:
        device_type = "desktop"

    if "firefox" in ua:
        browser = "Firefox"
    elif "edg" in ua:
        browser = "Edge"
    elif "chrome" in ua:
        browser = "Chrome"
    elif "safari" in ua:
        browser = "Safari"
    else:
        browser = "Other"

    return device_type, browser


async def _log_request(
    path: str,
    ip: str,
    referrer: str | None,
    user_agent: str | None,
    is_admin: bool,
):
    if is_admin:
        return

    device_type, browser = _parse_user_agent(user_agent or "")

    async with AsyncSessionLocal() as session:
        event = AnalyticsEvent(
            path=path,
            referrer=referrer,
            user_agent=user_agent,
            device_type=device_type,
            browser=browser,
            ip_address=ip,
        )
        session.add(event)
        await session.commit()


class AnalyticsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # skip static files, docs, and health
        if any(path.startswith(skip) for skip in SKIP_PATHS) or path.startswith(
            "/uploads"
        ):
            return await call_next(request)

        ip = request.client.host if request.client else "unknown"
        referrer = request.headers.get("referer")
        user_agent = request.headers.get("user-agent")
        is_admin = request.headers.get("x-admin-key") == settings.admin_api_key

        # process the request first, then log after
        response = await call_next(request)

        # fire and forget — don't await, don't block the response
        import asyncio

        asyncio.create_task(_log_request(path, ip, referrer, user_agent, is_admin))

        return response
