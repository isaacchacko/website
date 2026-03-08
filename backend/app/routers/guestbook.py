from math import ceil
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    BackgroundTasks,
    status,
    Header,
)
from sqlmodel import select, func, col
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.auth import get_admin_key
from app.config import settings

# from app.services.rate_limiter import check_rate_limit
from app.services.email import send_guestbook_notification
from app.models.guestbook import (
    GuestbookEntry,
    GuestbookEntryCreate,
    GuestbookEntryPublic,
    GuestbookPage,
)


router = APIRouter(prefix="/guestbook", tags=["guestbook"])


async def notify_new_entry(entry: GuestbookEntry):
    # TODO: implement email notification in Day 1.2
    print(f"New guestbook entry from {entry.name}: {entry.message}")


@router.post(
    "/", response_model=GuestbookEntryPublic, status_code=status.HTTP_201_CREATED
)
async def create_entry(
    entry: GuestbookEntryCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    ip = request.client.host if request.client else "unknown"

    # allowed = await check_rate_limit(
    #     key=f"ratelimit:guestbook:{ip}",
    #     limit=1,
    #     window_seconds=3600,
    # )
    # if not allowed:
    #     raise HTTPException(
    #         status_code=status.HTTP_429_TOO_MANY_REQUESTS,
    #         detail="You can only post once per hour.",
    #     )
    #
    db_entry = GuestbookEntry(
        name=entry.name,
        message=entry.message,
        website=entry.website,
        ip_address=ip,
    )
    session.add(db_entry)
    await session.commit()
    await session.refresh(db_entry)

    background_tasks.add_task(
        send_guestbook_notification,
        db_entry.name,
        db_entry.message,
        db_entry.website,
    )

    return db_entry


@router.get("/", response_model=GuestbookPage)
async def list_entries(
    page: int = 1,
    per_page: int = 20,
    session: AsyncSession = Depends(get_session),
    x_admin_key: str = Header(None),
):
    is_admin = x_admin_key == settings.admin_api_key

    per_page = min(per_page, 50)
    offset = (page - 1) * per_page

    base_query = select(GuestbookEntry)
    if not is_admin:
        base_query = base_query.where(GuestbookEntry.is_approved)

    total_result = await session.execute(
        select(func.count(col(GuestbookEntry.id))).where(
            GuestbookEntry.is_approved if not is_admin else True
        )
    )
    total = total_result.scalar() or 0

    entries_result = await session.execute(
        base_query.order_by(col(GuestbookEntry.created_at).desc())
        .offset(offset)
        .limit(per_page)
    )
    entries = list(entries_result.scalars().all())

    return GuestbookPage(
        items=[GuestbookEntryPublic.model_validate(e) for e in entries],
        total=total,
        page=page,
        per_page=per_page,
        pages=ceil(total / per_page) if total > 0 else 1,
    )


@router.patch("/{id}/approve", response_model=GuestbookEntryPublic)
async def approve_entry(
    id: int,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    entry = await session.get(GuestbookEntry, id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    entry.is_approved = True
    session.add(entry)
    await session.commit()
    await session.refresh(entry)
    return entry


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: int,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    entry = await session.get(GuestbookEntry, entry_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found"
        )

    await session.delete(entry)
    await session.commit()
