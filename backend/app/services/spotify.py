import base64
import json
import httpx
from redis.asyncio import Redis
from app.config import settings

LOCK_KEY = "spotify_token_refresh"
LOCK_TTL = 10  # seconds


async def _acquire_lock(redis: Redis) -> bool:
    """Same lock pattern as your Node code — SET NX with expiry."""
    return await redis.set(LOCK_KEY, "1", nx=True, ex=LOCK_TTL)


async def _release_lock(redis: Redis):
    await redis.delete(LOCK_KEY)


async def _get_valid_token(redis: Redis) -> str | None:
    """Read access token from Redis, refresh if expired."""
    access_token = await redis.get("spotify_access_token")
    refresh_token = await redis.get("spotify_refresh_token")
    expiry = await redis.get("spotify_expiry")

    if not refresh_token:
        return None

    # Token still valid
    if access_token and expiry:
        import time

        if int(time.time() * 1000) < int(expiry):
            return access_token

    # Need to refresh — acquire lock
    locked = await _acquire_lock(redis)
    if not locked:
        # Someone else is refreshing, wait a beat and re-read
        import asyncio

        await asyncio.sleep(0.5)
        return await redis.get("spotify_access_token")

    try:
        credentials = f"{settings.spotify_client_id}:{settings.spotify_client_secret}"
        auth_header = base64.b64encode(credentials.encode()).decode()

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://accounts.spotify.com/api/token",
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Basic {auth_header}",
                },
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                },
            )

        if resp.status_code != 200:
            return None

        data = resp.json()
        new_token = data["access_token"]
        expires_in = data["expires_in"]
        import time

        new_expiry = str(int(time.time() * 1000) + expires_in * 1000)

        await redis.set("spotify_access_token", new_token)
        await redis.set("spotify_expiry", new_expiry)

        return new_token
    finally:
        await _release_lock(redis)


async def get_current_track(redis: Redis) -> dict | None:
    """Fetch currently playing track. Returns None if nothing playing."""

    # Check cache first
    cached = await redis.get("spotify_now_playing")
    if cached:
        return json.loads(cached)

    token = await _get_valid_token(redis)
    if not token:
        return None

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            headers={"Authorization": f"Bearer {token}"},
        )

    if resp.status_code == 204 or resp.status_code != 200:
        return {"is_playing": False}

    playback = resp.json()

    if not playback.get("item"):
        return {"is_playing": False}

    result = {
        "is_playing": playback.get("is_playing", False),
        "track": playback["item"]["name"],
        "artist": [a["name"] for a in playback["item"]["artists"]],
        "artist_uri": [a["uri"] for a in playback["item"]["artists"]],
        "album": playback["item"]["album"]["name"],
        "album_uri": playback["item"]["album"]["uri"],
        "image": playback["item"]["album"]["images"][0]["url"]
        if playback["item"]["album"]["images"]
        else None,
        "progress": playback.get("progress_ms"),
        "duration": playback["item"]["duration_ms"],
        "explicit": playback["item"]["explicit"],
        "popularity": playback["item"]["popularity"],
        "track_url": playback["item"]["external_urls"]["spotify"],
    }

    # Cache for 30 seconds
    await redis.set("spotify_now_playing", json.dumps(result), ex=30)

    return result
