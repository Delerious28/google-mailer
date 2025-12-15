import json
import os
from datetime import datetime
from typing import Optional

from cryptography.fernet import Fernet
from fastapi import HTTPException
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from sqlalchemy.orm import Session

from .models import User

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "openid",
    "email",
    "profile",
]


def _fernet() -> Fernet:
    key = os.environ.get("ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("ENCRYPTION_KEY env var required for token encryption")
    return Fernet(key.encode())


def get_flow(state: Optional[str] = None) -> Flow:
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI")
    if not all([client_id, client_secret, redirect_uri]):
        raise RuntimeError("Google OAuth environment variables are missing")
    return Flow(
        client_config={
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uris": [redirect_uri],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=redirect_uri,
        state=state,
    )


def auth_url(state: str) -> str:
    flow = get_flow(state)
    flow.params.update({"access_type": "offline", "prompt": "consent"})
    auth_uri, _ = flow.authorization_url(include_granted_scopes="true")
    return auth_uri


def exchange_code(db: Session, code: str) -> User:
    flow = get_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    email = credentials.id_token.get("email") if credentials.id_token else None
    if not email:
        raise HTTPException(status_code=400, detail="Unable to determine account email")

    token_data = credentials.to_json()
    encrypted = _fernet().encrypt(token_data.encode()).decode()

    user = db.query(User).filter(User.email == email).first()
    if user:
        user.token_encrypted = encrypted
    else:
        user = User(email=email, token_encrypted=encrypted)
        db.add(user)
    db.commit()
    db.refresh(user)
    return user


def load_credentials(user: User) -> Credentials:
    decrypted = _fernet().decrypt(user.token_encrypted.encode()).decode()
    data = json.loads(decrypted)
    cred = Credentials.from_authorized_user_info(data, scopes=SCOPES)
    if cred and cred.expired and cred.refresh_token:
        cred.refresh(Request())
    return cred


def disconnect(db: Session, user: User):
    db.delete(user)
    db.commit()


def current_user(db: Session) -> Optional[User]:
    return db.query(User).first()
