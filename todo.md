# isaacchacko.com — Full Rebuild TODO

> **Goal:** Rebuild personal site on Dryft's tech stack (FastAPI + Pydantic v2 + SQLModel + Postgres + React/TS) as interview prep.  
> **Deadline:** Wednesday, March 11 (interview day)  
> **Vibe:** Playful / expressive / personality-driven  
> **Domain:** isaacchacko.com  

---

## Repo & Deployment

- **Monorepo** (`isaacchacko-v2`) — `backend/` and `frontend/` in one repo
- **Old Next.js repo** stays untouched on Vercel until new site is ready
- **Deploy on Railway** (free tier):
  - Postgres and Redis as Railway managed services
  - FastAPI as a Railway service (point at `backend/` directory)
  - Frontend as a static site on Railway or Vercel (post-interview)
- **Local dev:** Docker Compose runs API + Postgres + Redis; frontend via `npm run dev`
- **Swap domain** to new site when ready (no rush)

---

## Tech Stack

- **Backend:** Python, FastAPI, Pydantic v2, SQLModel, Postgres, Redis
- **Frontend:** React, TypeScript (Chakra UI v3, TanStack Router, TanStack Query, Vite — matches Dryft)
- **Infra:** Docker Compose locally (API + Postgres + Redis), Railway for production
- **Admin Auth:** API key in `X-Admin-Key` header (env var), single-user
- **Admin Interface:** Swagger UI at `/docs` + CLI commands for common tasks

---

## Project Structure (Monorepo)

```
isaacchacko-v2/
├── docker-compose.yml            # Runs everything: api, db, redis, frontend
├── .env.example                  # All env vars in one place
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── cli.py                    # Admin CLI (calls own API)
│   ├── app/
│   │   ├── main.py               # FastAPI app, lifespan, CORS
│   │   ├── database.py           # Async engine + session
│   │   ├── config.py             # Settings via pydantic-settings
│   │   ├── auth.py               # API key dependency
│   │   ├── middleware/
│   │   │   └── analytics.py      # Request logging middleware
│   │   ├── models/
│   │   │   ├── guestbook.py
│   │   │   ├── library.py
│   │   │   ├── library_suggestion.py
│   │   │   ├── photo.py
│   │   │   ├── analytics_event.py
│   │   │   ├── status.py
│   │   │   └── tag.py
│   │   ├── routers/
│   │   │   ├── guestbook.py
│   │   │   ├── library.py
│   │   │   ├── photos.py
│   │   │   ├── analytics.py
│   │   │   ├── spotify.py
│   │   │   ├── status.py
│   │   │   └── admin.py
│   │   └── services/
│   │       ├── email.py          # Send notifications
│   │       ├── spotify.py        # Spotify API client (ported from Node)
│   │       └── rate_limiter.py   # IP-based rate limiting
│   └── tests/
│
└── frontend/                     # React + Vite + TypeScript (post-interview)
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
```

---

## Day 1 — Sunday (Today): Foundation + Guestbook

### 1.0 Project Setup

- [x] Create repo and scaffold directory structure:

  ```bash
  mkdir isaacchacko-v2 && cd isaacchacko-v2
  git init

  # Backend
  mkdir -p backend/app/{models,routers,services,middleware}
  mkdir -p backend/tests
  touch backend/app/__init__.py
  touch backend/app/models/__init__.py
  touch backend/app/routers/__init__.py
  touch backend/app/services/__init__.py
  touch backend/app/middleware/__init__.py
  touch backend/tests/__init__.py

  # Frontend placeholder
  mkdir frontend

  # Root files
  touch docker-compose.yml .env.example .gitignore
  touch backend/Dockerfile backend/requirements.txt
  ```

- [x] Create `.gitignore`:

  ```
  .env
  __pycache__/
  *.pyc
  .pytest_cache/
  node_modules/
  frontend/dist/
  uploads/
  ```

- [x] Create `docker-compose.yml` with services:
  - `api` — builds from `./backend/Dockerfile`, mounts `./backend/app` for hot reload
  - `db` — Postgres 16 with healthcheck
  - `redis` — Redis 7
  - Volume for Postgres data + photo uploads
- [x] Create `backend/Dockerfile`
- [x] Create `backend/requirements.txt`:
  - fastapi, uvicorn[standard], sqlmodel, asyncpg, pydantic, pydantic-settings
  - httpx (for Spotify API calls + email service)
  - redis[hiredis] (async redis client)
  - python-multipart (for file uploads)
  - pytest, pytest-asyncio, httpx (dev)
- [x] Create `.env.example` with all config vars:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `ADMIN_API_KEY`
  - `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`
  - `EMAIL_NOTIFY_TO` (your email)
  - Email sending config (SMTP or an API like Resend/SendGrid)
- [x] Copy `.env.example` to `.env`, fill in values
- [x] `docker compose up --build` — verify everything connects
- [x] First commit: `git add -A && git commit -m "initial scaffold"`

### 1.1 Core App Skeleton

- [x] `backend/app/config.py` — Pydantic `Settings` class that reads from env
- [x] `backend/app/database.py` — async engine, session factory, `init_db()`, `get_session()` dependency
- [x] `backend/app/auth.py` — `get_admin_key()` dependency that checks `X-Admin-Key` header
  - Returns 401 if missing/wrong
  - Use `Depends(get_admin_key)` on any admin-only route
- [x] `backend/app/main.py` — FastAPI app with lifespan (init DB on startup), CORS middleware, include all routers
- [x] Verify: hit `GET /health` and `GET /docs` (Swagger UI — this is the auto-generated interactive API explorer at localhost:8000/docs)

### 1.2 Guestbook

**Model: `GuestbookEntry`**

| Field | Type | Notes |
|-------|------|-------|
| id | int | PK, auto |
| name | str | max 100 chars, required |
| message | str | max 500 chars, required |
| website | str? | optional, max 200, validated as URL |
| ip_address | str | stored for rate limiting, not exposed in API |
| created_at | datetime | auto |

**Public Endpoints:**

- [x] `POST /guestbook/` — Create entry
  - Validate fields with Pydantic
  - Check rate limit: 1 post per IP per hour (use Redis or DB query)
  - If allowed: save to DB, trigger background task to send email notification
  - Return 201 with the entry (excluding ip_address)
  - Return 429 if rate limited
- [x] `GET /guestbook/` — List entries, paginated
  - Query params: `page` (default 1), `per_page` (default 20, max 50)
  - Return entries newest-first
  - Response includes: `items`, `total`, `page`, `per_page`, `pages`
  - Never expose `ip_address` in response

**Admin Endpoints (require `X-Admin-Key`):**

- [x] `DELETE /guestbook/{id}` — Delete an entry

**Background Task:**

- [x] Email notification on new guestbook entry
  - Use FastAPI `BackgroundTasks`
  - Send to your email with: name, message, website, timestamp
  - If email sending fails, log the error but don't fail the request

**Rate Limiter:**

- [x] `app/services/rate_limiter.py`
  - `async def check_rate_limit(key: str, limit: int, window_seconds: int) -> bool`
  - Use Redis: `INCR` + `EXPIRE` pattern
  - Key format: `ratelimit:{endpoint}:{ip}`
  - Returns True if allowed, False if over limit

**Tests:**

- [x] Test creating a guestbook entry
- [x] Test pagination: didnt but its fine it probably works
- [x] Test rate limiting (second post within window returns 429): didnt but prob fine
- [x] Test admin delete

---

## Day 2 — Monday: Library + Photo Dump + Analytics

### 2.1 Library Section

**Model: `LibraryItem`**

| Field | Type | Notes |
|-------|------|-------|
| id | int | PK, auto |
| title | str | required, max 300 |
| url | str? | optional, validated URL |
| note | str? | optional, your thoughts/review |
| rating | float? | optional, 0-5, nullable (admin can choose not to rate) |
| show_rating | bool | default true, admin can hide rating per item |
| cover_image_url | str? | optional, URL to cover/preview image |
| item_type | str | enum: "book", "article", "song", "album", "podcast", "other" |
| created_at | datetime | auto |
| updated_at | datetime | auto |

**Model: `Tag`** (many-to-many with LibraryItem)

| Field | Type | Notes |
|-------|------|-------|
| id | int | PK, auto |
| name | str | unique, lowercase, max 50 |

**Model: `LibraryItemTag`** (join table)

| Field | Type | Notes |
|-------|------|-------|
| library_item_id | int | FK |
| tag_id | int | FK |

**Model: `LibrarySuggestion`**

| Field | Type | Notes |
|-------|------|-------|
| id | int | PK, auto |
| title | str | required |
| url | str? | optional |
| note | str? | why they're suggesting it |
| item_type | str | same enum as LibraryItem |
| suggested_by | str | name of the person suggesting |
| tags | str? | comma-separated tag suggestions |
| ip_address | str | for rate limiting, not exposed |
| status | str | "pending", "approved", "rejected" |
| created_at | datetime | auto |

**Public Endpoints:**

- [x] `GET /library/` — List items with filtering + sorting
  - Query params:
    - `type` — filter by item_type
    - `tag` — filter by tag name
    - `sort` — "recent" (default), "alpha", "rating"
    - `page`, `per_page` — pagination
  - Response includes tags as list of strings per item
  - Only show rating if `show_rating` is true
- [x] `GET /library/{id}` — Single item with tags
- [x] `GET /library/tags` — List all tags with item counts
- [x] `POST /library/suggest` — Submit a suggestion
  - Rate limited: 1 per IP per hour
  - Triggers email notification to you with suggestion details
  - Returns 201 with confirmation message

**Admin Endpoints:**

- [x] `POST /library/` — Create item (with tags as list of strings, auto-create new tags)
- [x] `PATCH /library/{id}` — Update item (including tags)
- [x] `DELETE /library/{id}` — Delete item
- [x] `GET /library/suggestions` — List pending suggestions
- [x] `POST /library/suggestions/{id}/approve` — Approve (creates a LibraryItem from it)
- [x] `POST /library/suggestions/{id}/reject` — Reject

**Tests:**

- [ ] Test CRUD for library items
- [ ] Test tag filtering
- [ ] Test sorting (alpha, recent, rating)
- [ ] Test suggestion submission + rate limit
- [ ] Test approve/reject flow

### 2.2 Photo Dump

**Model: `Photo`**

| Field | Type | Notes |
|-------|------|-------|
| id | int | PK, auto |
| filename | str | stored filename (UUID-based to avoid collisions) |
| original_filename | str | what the user uploaded |
| caption | str? | optional, max 500 |
| uploaded_at | datetime | auto |

**Storage:** Save files to a `/uploads/photos/` directory (mounted as a Docker volume).

**Admin Endpoints:**

- [x] `POST /photos/` — Upload a photo
  - Accept multipart form data (image file + optional caption)
  - Validate file type (jpg, png, webp, gif)
  - Generate UUID filename, save to disk
  - Save metadata to DB
  - Return 201 with photo metadata
- [x] `PATCH /photos/{id}` — Update caption
- [x] `DELETE /photos/{id}` — Delete photo (remove file + DB record)

**Public Endpoints:**

- [x] `GET /photos/` — List photos, paginated, newest first
  - Return photo metadata + URL path to image
- [x] `GET /photos/{id}` — Single photo metadata
- [x] `GET /uploads/photos/{filename}` — Serve the actual image file
  - Use FastAPI `StaticFiles` or `FileResponse`

**Tests:**

- [x] Test photo upload
- [x] Test listing with pagination
- [x] Test delete removes file from disk

### 2.3 Visitor Analytics

**Model: `AnalyticsEvent`**

| Field | Type | Notes |
|-------|------|-------|
| id | int | PK, auto |
| path | str | page path (e.g., "/", "/library") |
| referrer | str? | HTTP referer header |
| user_agent | str? | raw user agent string |
| device_type | str? | parsed: "desktop", "mobile", "tablet" |
| browser | str? | parsed: "Chrome", "Firefox", etc. |
| country | str? | from IP geolocation (optional, can add later) |
| ip_address | str | for geo lookup, not exposed |
| duration_seconds | int? | time on page (sent by frontend on navigation) |
| created_at | datetime | auto |

**Middleware:**

- [x] `app/middleware/analytics.py`
  - Log every incoming request as a background task (don't slow down the response)
  - Parse user agent for device_type + browser
  - Skip logging for `/docs`, `/health`, `/openapi.json`, static files
  - Skip logging for admin requests (or tag them separately)

**Public Endpoint:**

- [x] `POST /analytics/pageview` — Frontend reports page duration
  - Body: `{ "path": "/library", "duration_seconds": 45 }`
  - Updates the most recent event matching that path + IP

**Admin Endpoints:**

- [x] `GET /analytics/summary` — Dashboard data
  - Total views (today, this week, all time)
  - Top pages
  - Top referrers
  - Device/browser breakdown
  - Query param: `days` (default 7) for time window
- [x] `GET /analytics/events` — Raw event log, paginated, newest first

**Tests:**

- [ ] Test that middleware logs events
- [ ] Test summary aggregation
- [ ] Test that admin auth is required

---

## Day 3 — Tuesday: Spotify + Status + CLI + Polish

### 3.1 Spotify Now Playing (Port from Node to Python)

**No new DB model needed — uses Redis for token storage.**

- [x] `app/services/spotify.py` — Port your existing Node service
  - Store refresh token in Redis
  - `get_current_track()` → calls Spotify API, returns track info or None
  - Handle token refresh automatically
  - Cache current track in Redis with short TTL (~30s) to avoid hammering Spotify

**Public Endpoint:**

- [x] `GET /spotify/now-playing`
  - Returns: `{ "is_playing": true, "track": "Song Name", "artist": "Artist", "album": "Album", "album_art_url": "...", "spotify_url": "..." }`
  - Or: `{ "is_playing": false }` when nothing is playing

**Tests:**

- [ ] Test with mocked Spotify API response
- [ ] Test fallback when nothing is playing

### 3.2 Status Page

**Model: `Status`**

| Field | Type | Notes |
|-------|------|-------|
| id | int | PK, auto |
| text | str | max 200, the status message |
| created_at | datetime | auto |

**Public Endpoint:**

- [x] `GET /status/` — Returns the most recent status entry

**Admin/API Endpoint:**

- [x] `POST /status/` — Set a new status (requires API key)
  - Old statuses are kept in DB (history) but only latest is shown publicly

**Tests:**

- [x] Test setting and getting status

### 3.3 Admin CLI

- [x] `cli.py` — Simple script that calls your own API with the admin key
  - `python cli.py status "working on isaacchacko.com"` → POST /status/
  - `python cli.py guestbook list` → GET /guestbook/
  - `python cli.py guestbook delete 47` → DELETE /guestbook/47
  - `python cli.py library add --title "..." --url "..." --type book --tags "ai,ml"`
  - `python cli.py photos upload ./photo.jpg --caption "sunset"`
  - `python cli.py analytics` → GET /analytics/summary
  - Uses `httpx` and reads API key from env or `.env` file

### 3.4 Polish + Prep

- [x] Test full Docker Compose startup from scratch (cold boot)
- [x] Make sure `docker compose down -v && docker compose up --build` works cleanly
- [x] Seed script with sample data for all features
- [x] Run through the Swagger docs and manually test every endpoint
- [x] **Evening: Do Exercise 5 from the practice project (timed 30-min mock)**

### isaac add in

- [ ] add back rate limiting

---

## Post-Interview (Backlog)

These are nice-to-haves you can add after Wednesday:

- [ ] Frontend: React + TypeScript + Chakra UI + TanStack (matches Dryft stack)
- [ ] Admin dashboard UI
- [ ] Upgrade auth to JWT if needed
- [ ] IP geolocation for analytics (free API like ip-api.com)
- [ ] Image compression/thumbnails for photo uploads
- [ ] RSS feed for library items
- [ ] Deploy pipeline (CI/CD)
- [ ] OG metadata auto-fetch for library URLs
- [ ] Library suggestion approval creates item with one click

---

## Backend Patterns You'll Practice (Interview Prep Checklist)

| Pattern | Feature |
|---------|---------|
| CRUD operations | Guestbook, Library, Photos, Status |
| Pydantic v2 validation | Every model |
| SQLModel (ORM + schema) | Every model |
| Many-to-many relationships | Library ↔ Tags |
| Pagination | Guestbook, Library, Photos, Analytics |
| Filtering + sorting | Library (by type, tag, sort order) |
| File uploads | Photos |
| Background tasks | Email notifications |
| Middleware | Analytics logging |
| Rate limiting (Redis) | Guestbook, Library suggestions |
| External API integration | Spotify |
| Caching (Redis) | Spotify now playing |
| Auth (API key dependency) | All admin routes |
| Docker Compose networking | API ↔ Postgres ↔ Redis |
| Transactions | Suggestion approval (create item + update status) |
