from fastapi import APIRouter, Depends
from sqlmodel import select, col
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.auth import get_admin_key
from app.models.status import Status, StatusCreate, StatusPublic

router = APIRouter(prefix="/status", tags=["status"])


@router.get("/")
async def get_status(session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Status).order_by(col(Status.created_at).desc()).limit(1)
    )
    status = result.scalars().first()
    if not status:
        return {"text": None}
    return StatusPublic.model_validate(status)


@router.post("/", status_code=201)
async def set_status(
    body: StatusCreate,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    status = Status(text=body.text)
    session.add(status)
    await session.commit()
    await session.refresh(status)
    return StatusPublic.model_validate(status)
