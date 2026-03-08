from redis.asyncio import Redis
from app.config import settings

redis = Redis.from_url(settings.redis_url)


async def check_rate_limit(key: str, limit: int, window_seconds: int) -> bool:
    """
    Returns True if the request is allowed, False if rate limited.
    Key format: ratelimit:{endpoint}:{ip}
    """
    current = await redis.incr(key)

    if current == 1:
        # first request in this window — set the expiry
        await redis.expire(key, window_seconds)

    return current <= limit
