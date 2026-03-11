from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


# ── Join table ────────────────────────────────────────────────────────────────

class LibraryItemTag(SQLModel, table=True):
    item_id: Optional[int] = Field(
        default=None, foreign_key="libraryitem.id", primary_key=True
    )
    tag_id: Optional[int] = Field(
        default=None, foreign_key="tag.id", primary_key=True
    )


# ── Tag ───────────────────────────────────────────────────────────────────────

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)

    items: list["LibraryItem"] = Relationship(
        back_populates="tags", link_model=LibraryItemTag
    )


# ── LibraryItem ───────────────────────────────────────────────────────────────

class LibraryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=300)
    url: Optional[str] = Field(default=None)
    note: Optional[str] = Field(default=None)
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    show_rating: bool = Field(default=True)
    cover_image_url: Optional[str] = Field(default=None)
    item_type: str = Field(max_length=50)  # book, article, song, album, podcast, other
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    tags: list[Tag] = Relationship(
        back_populates="items", link_model=LibraryItemTag
    )


# ── Schemas ───────────────────────────────────────────────────────────────────

class LibraryItemCreate(SQLModel):
    title: str = Field(max_length=300)
    url: Optional[str] = None
    note: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    show_rating: bool = True
    cover_image_url: Optional[str] = None
    item_type: str
    tags: list[str] = []  # list of tag names


class LibraryItemUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=300)
    url: Optional[str] = None
    note: Optional[str] = None
    rating: Optional[float] = Field(default=None, ge=0, le=5)
    show_rating: Optional[bool] = None
    cover_image_url: Optional[str] = None
    item_type: Optional[str] = None
    tags: Optional[list[str]] = None


class TagPublic(SQLModel):
    id: int
    name: str


class LibraryItemPublic(SQLModel):
    id: int
    title: str
    url: Optional[str]
    note: Optional[str]
    rating: Optional[float]
    show_rating: bool
    cover_image_url: Optional[str]
    item_type: str
    created_at: datetime
    updated_at: datetime
    tags: list[str] = []  # just tag names, not full objects


class TagWithCount(SQLModel):
    id: int
    name: str
    count: int


class LibraryPage(SQLModel):
    items: list[LibraryItemPublic]
    total: int
    page: int
    per_page: int
    pages: int
