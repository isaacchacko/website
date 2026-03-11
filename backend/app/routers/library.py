from math import ceil
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    BackgroundTasks,
    Header,
    status,
)
from sqlmodel import select, func, col
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.auth import get_admin_key
from app.config import settings
from app.services.rate_limiter import check_rate_limit
from app.services.email import send_suggestion_notification
from app.models.library import (
    LibraryItem,
    LibraryItemCreate,
    LibraryItemUpdate,
    LibraryItemPublic,
    LibraryPage,
    Tag,
    LibraryItemTag,
    TagWithCount,
)
from app.models.library_suggestion import (
    LibrarySuggestion,
    LibrarySuggestionCreate,
    LibrarySuggestionPublic,
)


router = APIRouter(prefix="/library", tags=["library"])


# ── Helpers ───────────────────────────────────────────────────────────────────


async def _get_or_create_tags(session: AsyncSession, tag_names: list[str]) -> list[Tag]:
    tags = []
    for name in tag_names:
        name = name.strip().lower()
        result = await session.execute(select(Tag).where(Tag.name == name))
        tag = result.scalar_one_or_none()
        if not tag:
            tag = Tag(name=name)
            session.add(tag)
            await session.flush()  # get the id without committing
        tags.append(tag)
    return tags


async def _item_to_public(
    session: AsyncSession, item: LibraryItem
) -> LibraryItemPublic:
    result = await session.execute(
        select(Tag)
        .join(LibraryItemTag, LibraryItemTag.tag_id == col(Tag.id))
        .where(LibraryItemTag.item_id == item.id)
    )
    tags = result.scalars().all()
    return LibraryItemPublic(
        id=item.id,
        title=item.title,
        url=item.url,
        note=item.note,
        rating=item.rating if item.show_rating else None,
        show_rating=item.show_rating,
        cover_image_url=item.cover_image_url,
        item_type=item.item_type,
        created_at=item.created_at,
        updated_at=item.updated_at,
        tags=[tag.name for tag in tags],
    )


# ── Public endpoints ──────────────────────────────────────────────────────────


@router.get("/", response_model=LibraryPage)
async def list_items(
    item_type: str | None = None,
    tag: str | None = None,
    sort: str = "recent",
    page: int = 1,
    per_page: int = 20,
    session: AsyncSession = Depends(get_session),
):
    per_page = min(per_page, 50)
    offset = (page - 1) * per_page

    query = select(LibraryItem)

    if item_type:
        query = query.where(LibraryItem.item_type == item_type)

    if tag:
        result = await session.execute(select(Tag).where(Tag.name == tag.lower()))
        tag_obj = result.scalar_one_or_none()
        if not tag_obj:
            return LibraryPage(items=[], total=0, page=page, per_page=per_page, pages=1)
        query = query.join(
            LibraryItemTag, LibraryItemTag.item_id == col(LibraryItem.id)
        ).where(LibraryItemTag.tag_id == tag_obj.id)

    if sort == "alpha":
        query = query.order_by(col(LibraryItem.title).asc())
    elif sort == "rating":
        query = query.order_by(col(LibraryItem.rating).desc())
    else:
        query = query.order_by(col(LibraryItem.created_at).desc())

    total_result = await session.execute(select(func.count(col(LibraryItem.id))))
    total = total_result.scalar() or 0

    items_result = await session.execute(query.offset(offset).limit(per_page))
    items = list(items_result.scalars().all())

    public_items = [await _item_to_public(session, item) for item in items]

    return LibraryPage(
        items=public_items,
        total=total,
        page=page,
        per_page=per_page,
        pages=ceil(total / per_page) if total > 0 else 1,
    )


@router.get("/tags", response_model=list[TagWithCount])
async def list_tags(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Tag, func.count(col(LibraryItemTag.item_id)).label("count"))
        .join(LibraryItemTag, LibraryItemTag.tag_id == col(Tag.id), isouter=True)
        .group_by(col(Tag.id))
        .order_by(col(Tag.name).asc())
    )
    rows = result.all()
    return [TagWithCount(id=row[0].id, name=row[0].name, count=row[1]) for row in rows]


@router.get("/suggestions", response_model=list[LibrarySuggestionPublic])
async def list_suggestions(
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    result = await session.execute(
        select(LibrarySuggestion)
        .where(LibrarySuggestion.status == "pending")
        .order_by(col(LibrarySuggestion.created_at).desc())
    )
    return list(result.scalars().all())


@router.get("/{item_id}", response_model=LibraryItemPublic)
async def get_item(item_id: int, session: AsyncSession = Depends(get_session)):
    item = await session.get(LibraryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return await _item_to_public(session, item)


@router.post("/suggest", status_code=status.HTTP_201_CREATED)
async def suggest_item(
    suggestion: LibrarySuggestionCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    ip = request.client.host if request.client else "unknown"

    # allowed = await check_rate_limit(
    #     key=f"ratelimit:suggest:{ip}",
    #     limit=1,
    #     window_seconds=3600,
    # )
    # if not allowed:
    #     raise HTTPException(status_code=429, detail="You can only suggest once per hour.")

    db_suggestion = LibrarySuggestion(
        **suggestion.model_dump(),
        ip_address=ip,
    )
    session.add(db_suggestion)
    await session.commit()
    await session.refresh(db_suggestion)

    background_tasks.add_task(send_suggestion_notification, db_suggestion)

    return {"message": "Suggestion submitted, thank you!"}


# ── Admin endpoints ───────────────────────────────────────────────────────────


@router.post("/", response_model=LibraryItemPublic, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: LibraryItemCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    tag_names = item.tags
    item_data = item.model_dump(exclude={"tags"})
    db_item = LibraryItem(**item_data)
    session.add(db_item)
    await session.flush()

    tags = await _get_or_create_tags(session, tag_names)
    for tag in tags:
        session.add(LibraryItemTag(item_id=db_item.id, tag_id=tag.id))

    await session.commit()
    await session.refresh(db_item)
    return await _item_to_public(session, db_item)


@router.patch("/{item_id}", response_model=LibraryItemPublic)
async def update_item(
    item_id: int,
    update: LibraryItemUpdate,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    from datetime import datetime

    item = await session.get(LibraryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = update.model_dump(exclude_unset=True, exclude={"tags"})
    for key, value in update_data.items():
        setattr(item, key, value)
    item.updated_at = datetime.utcnow()

    if update.tags is not None:
        # remove existing tags
        await session.execute(
            LibraryItemTag.__table__.delete().where(LibraryItemTag.item_id == item_id)
        )
        tags = await _get_or_create_tags(session, update.tags)
        for tag in tags:
            session.add(LibraryItemTag(item_id=item.id, tag_id=tag.id))

    session.add(item)
    await session.commit()
    await session.refresh(item)
    return await _item_to_public(session, item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    item = await session.get(LibraryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await session.delete(item)
    await session.commit()


@router.post("/suggestions/{suggestion_id}/approve", response_model=LibraryItemPublic)
async def approve_suggestion(
    suggestion_id: int,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    suggestion = await session.get(LibrarySuggestion, suggestion_id)
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    tag_names = (
        [t.strip() for t in suggestion.tags.split(",")] if suggestion.tags else []
    )
    db_item = LibraryItem(
        title=suggestion.title,
        url=suggestion.url,
        note=suggestion.note,
        item_type=suggestion.item_type,
    )
    session.add(db_item)
    await session.flush()

    tags = await _get_or_create_tags(session, tag_names)
    for tag in tags:
        session.add(LibraryItemTag(item_id=db_item.id, tag_id=tag.id))

    suggestion.status = "approved"
    session.add(suggestion)
    await session.commit()
    await session.refresh(db_item)
    return await _item_to_public(session, db_item)


@router.post(
    "/suggestions/{suggestion_id}/reject", status_code=status.HTTP_204_NO_CONTENT
)
async def reject_suggestion(
    suggestion_id: int,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    suggestion = await session.get(LibrarySuggestion, suggestion_id)
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    suggestion.status = "rejected"
    session.add(suggestion)
    await session.commit()
