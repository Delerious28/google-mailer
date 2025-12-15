import json
import os
from typing import Optional
from pathlib import Path

from cryptography.fernet import Fernet
from fastapi import HTTPException
from google.auth.transport.requests import Request
from google.oauth2 import id_token as google_id_token
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from sqlalchemy.orm import Session

from .models import User

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]


def _fernet() -> Fernet:
    """Return a Fernet instance, using env or a local key file."""
    key = os.environ.get("ENCRYPTION_KEY")
    if not key:
        root = Path(__file__).resolve().parents[2]
        key_file = root / "encryption_key.txt"
        if key_file.exists():
            key = key_file.read_text(encoding="utf-8").strip()
        else:
            key_bytes = Fernet.generate_key()
            key = key_bytes.decode()
            try:
                key_file.write_text(key, encoding="utf-8")
            except Exception:
                pass
    if not key:
        raise RuntimeError("Missing encryption key. Set ENCRYPTION_KEY or ensure encryption_key.txt exists.")
    return Fernet(key.encode() if isinstance(key, str) else key)


def _load_client_config_from_json() -> Optional[dict]:
    try:
        root = Path(__file__).resolve().parents[2]
        candidates = list(root.glob("client_secret*.json")) or list(root.glob("*.json"))
        for p in candidates:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            cfg = data.get("installed") or data.get("web")
            if cfg and cfg.get("client_id") and cfg.get("client_secret"):
                return cfg
    except Exception:
        pass
    return None


def get_flow(state: Optional[str] = None) -> Flow:
    cfg = _load_client_config_from_json()
    if cfg:
        client_id = cfg.get("client_id")
        client_secret = cfg.get("client_secret")
        redirect_uris = cfg.get("redirect_uris") or ["http://localhost:8000/api/auth/callback"]
        redirect_uri = redirect_uris[0]
        if redirect_uri.strip().lower() in ("http://localhost", "https://localhost"):
            redirect_uri = "http://localhost:8000/api/auth/callback"
        auth_uri = cfg.get("auth_uri") or "https://accounts.google.com/o/oauth2/auth"
        token_uri = cfg.get("token_uri") or "https://oauth2.googleapis.com/token"
    else:
        client_id = os.environ.get("GOOGLE_CLIENT_ID")
        client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
        redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI") or "http://localhost:8000/api/auth/callback"
        auth_uri = os.environ.get("GOOGLE_AUTH_URI") or "https://accounts.google.com/o/oauth2/auth"
        token_uri = os.environ.get("GOOGLE_TOKEN_URI") or "https://oauth2.googleapis.com/token"

    if not all([client_id, client_secret, redirect_uri]):
        raise RuntimeError("Google OAuth configuration is missing (client id/secret/redirect).")

    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uris": [redirect_uri],
            "auth_uri": auth_uri,
            "token_uri": token_uri,
        }
    }
    flow = Flow.from_client_config(client_config, scopes=SCOPES)
    flow.redirect_uri = redirect_uri
    return flow


def auth_url(state: str) -> str:
    flow = get_flow(state)
    auth_uri, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    return auth_uri


def _email_from_credentials(credentials: Credentials) -> Optional[str]:
    try:
        if credentials.id_token:
            client_id = None
            try:
                client_id = credentials._client_id  # type: ignore[attr-defined]
            except Exception:
                client_id = None
            info = google_id_token.verify_oauth2_token(credentials.id_token, Request(), audience=client_id)
            return info.get("email")
    except Exception:
        pass
    return None


def exchange_code(db: Session, code: str) -> User:
    flow = get_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    email = _email_from_credentials(credentials)
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
