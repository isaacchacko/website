from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis.asyncio import from_url as redis_from_url
from app.database import init_db
from app.config import settings
from app.routers import guestbook, library, photo, analytics, spotify, status
from app.middleware.analytics import AnalyticsMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    app.state.redis = redis_from_url(settings.redis_url, decode_responses=True)

    yield

    await app.state.redis.close()


app = FastAPI(lifespan=lifespan)

app.include_router(guestbook.router)
app.include_router(library.router)
app.include_router(photo.router)
app.include_router(analytics.router)
app.include_router(spotify.router)
app.include_router(status.router)

app.add_middleware(AnalyticsMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend dev server (HTTP)
        "https://localhost:3000",  # Frontend dev server (HTTPS)
        "http://localhost:3001",  # Backend port (for direct access)
        "https://isaacchacko.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}
