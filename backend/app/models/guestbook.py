from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field


class GuestbookEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    message: str = Field(max_length=500)
    website: Optional[str] = Field(default=None, max_length=200)
    ip_address: str
    created_at: datetime = Field(default_factory=lambda: datetime.utcnow())
    is_approved: bool = Field(default=False)


class GuestbookEntryCreate(SQLModel):
    name: str = Field(max_length=100)
    message: str = Field(max_length=500)
    website: Optional[str] = Field(default=None, max_length=200)


class GuestbookEntryPublic(SQLModel):
    id: int
    name: str
    message: str
    website: Optional[str]
    created_at: datetime


class GuestbookPage(SQLModel):
    items: list[GuestbookEntryPublic]
    total: int
    page: int
    per_page: int
    pages: int
