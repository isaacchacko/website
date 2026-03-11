from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.services.spotify import get_current_track

router = APIRouter(prefix="/spotify", tags=["spotify"])


@router.get("/now-playing")
async def now_playing(request: Request):
    redis = request.app.state.redis
    result = await get_current_track(redis)

    if result is None:
        return JSONResponse(
            {"error": "Could not retrieve Spotify data"},
            status_code=503,
        )

    return result
