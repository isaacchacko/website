import base64
from email.message import EmailMessage
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from app.config import settings


def _get_gmail_service():
    creds = Credentials(
        token=None,
        refresh_token=settings.gmail_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.gmail_client_id,
        client_secret=settings.gmail_client_secret,
        scopes=["https://mail.google.com/"],
    )
    creds.refresh(Request())
    return build("gmail", "v1", credentials=creds)


async def send_guestbook_notification(name: str, message: str, website: str | None):
    try:
        msg = EmailMessage()
        msg["Subject"] = f"isaacchacko.com - new guestbook entry from {name}"
        msg["From"] = settings.email_notify_to
        msg["To"] = settings.email_notify_to
        msg.set_content(
            f"Name: {name}\nMessage: {message}\nWebsite: {website or 'none'}\n"
        )

        encoded = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        service = _get_gmail_service()
        service.users().messages().send(userId="me", body={"raw": encoded}).execute()

    except Exception as e:
        print(f"Failed to send email: {e}")
