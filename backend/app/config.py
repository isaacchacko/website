from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    admin_api_key: str

    spotify_client_id: str = ""
    spotify_client_secret: str = ""
    spotify_refresh_token: str = ""

    email_notify_to: str
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
