from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Photo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str                        # UUID-based stored filename
    original_filename: str               # what the user uploaded
    caption: Optional[str] = Field(default=None, max_length=500)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class PhotoPublic(SQLModel):
    id: int
    filename: str
    original_filename: str
    caption: Optional[str]
    uploaded_at: datetime
    url: str                             # full path to serve the image


class PhotoCaptionUpdate(SQLModel):
    caption: Optional[str] = Field(default=None, max_length=500)
