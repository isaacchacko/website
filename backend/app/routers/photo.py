import uuid
import os
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlmodel import select, func, col
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_session
from app.auth import get_admin_key
from app.models.photo import Photo, PhotoPublic, PhotoCaptionUpdate


router = APIRouter(prefix="/photos", tags=["photos"])

UPLOAD_DIR = "/app/uploads/photos"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def _to_public(photo: Photo) -> PhotoPublic:
    return PhotoPublic(
        id=photo.id,
        filename=photo.filename,
        original_filename=photo.original_filename,
        caption=photo.caption,
        uploaded_at=photo.uploaded_at,
        url=f"/uploads/photos/{photo.filename}",
    )


# ── Public endpoints ──────────────────────────────────────────────────────────


@router.get("/", response_model=dict)
async def list_photos(
    page: int = 1,
    per_page: int = 20,
    session: AsyncSession = Depends(get_session),
):
    per_page = min(per_page, 50)
    offset = (page - 1) * per_page

    total_result = await session.execute(select(func.count(col(Photo.id))))
    total = total_result.scalar() or 0

    result = await session.execute(
        select(Photo)
        .order_by(col(Photo.uploaded_at).desc())
        .offset(offset)
        .limit(per_page)
    )
    photos = list(result.scalars().all())

    return {
        "items": [_to_public(p) for p in photos],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 1,
    }


@router.get("/{photo_id}", response_model=PhotoPublic)
async def get_photo(photo_id: int, session: AsyncSession = Depends(get_session)):
    photo = await session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return _to_public(photo)


# ── File serving ──────────────────────────────────────────────────────────────


@router.get("/file/{filename}")
async def serve_photo(filename: str):
    path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)


# ── Admin endpoints ───────────────────────────────────────────────────────────


@router.post("/", response_model=PhotoPublic, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    file: UploadFile = File(...),
    caption: str | None = Form(None),
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Must be one of: jpg, png, webp, gif",
        )

    ext = os.path.splitext(file.filename or "photo.jpg")[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    photo = Photo(
        filename=unique_filename,
        original_filename=file.filename or unique_filename,
        caption=caption,
    )
    session.add(photo)
    await session.commit()
    await session.refresh(photo)
    return _to_public(photo)


@router.patch("/{photo_id}", response_model=PhotoPublic)
async def update_caption(
    photo_id: int,
    update: PhotoCaptionUpdate,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    photo = await session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    photo.caption = update.caption
    session.add(photo)
    await session.commit()
    await session.refresh(photo)
    return _to_public(photo)


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    photo_id: int,
    session: AsyncSession = Depends(get_session),
    _=Depends(get_admin_key),
):
    photo = await session.get(Photo, photo_id)
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    file_path = os.path.join(UPLOAD_DIR, photo.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    await session.delete(photo)
    await session.commit()
