from datetime import datetime
from sqlmodel import SQLModel, Field


class Status(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    text: str = Field(max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class StatusCreate(SQLModel):
    text: str = Field(max_length=200)


class StatusPublic(SQLModel):
    id: int
    text: str
    created_at: datetime
