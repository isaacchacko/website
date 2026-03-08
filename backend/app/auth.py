from fastapi import Header, HTTPException, status
from app.config import settings


async def get_admin_key(x_admin_key: str = Header(None)):
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin API key",
        )
