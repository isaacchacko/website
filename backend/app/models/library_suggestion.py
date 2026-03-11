from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class LibrarySuggestion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=300)
    url: Optional[str] = Field(default=None)
    note: Optional[str] = Field(default=None)
    item_type: str = Field(max_length=50)
    suggested_by: str = Field(max_length=100)
    tags: Optional[str] = Field(default=None)  # comma-separated tag suggestions
    ip_address: str
    status: str = Field(default="pending")  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LibrarySuggestionCreate(SQLModel):
    title: str = Field(max_length=300)
    url: Optional[str] = None
    note: Optional[str] = None
    item_type: str
    suggested_by: str = Field(max_length=100)
    tags: Optional[str] = None


class LibrarySuggestionPublic(SQLModel):
    id: int
    title: str
    url: Optional[str]
    note: Optional[str]
    item_type: str
    suggested_by: str
    tags: Optional[str]
    status: str
    created_at: datetime
