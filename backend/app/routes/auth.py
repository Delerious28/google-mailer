from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from ..auth_google import auth_url, current_user, disconnect, exchange_code
from ..db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/url")
def get_auth_url(state: str = "state"):
    return {"url": auth_url(state)}


@router.get("/callback")
def oauth_callback(code: str = Query(...), db: Session = Depends(get_db)):
    # Exchange code and persist credentials
    exchange_code(db, code)
    # Redirect back to the frontend root; UI will call /api/auth/me
    return RedirectResponse(url="/")


@router.get("/me")
def me(db: Session = Depends(get_db)):
    user = current_user(db)
    return {"email": user.email} if user else {}


@router.post("/disconnect")
def disconnect_account(db: Session = Depends(get_db)):
    user = current_user(db)
    if not user:
        raise HTTPException(status_code=404, detail="No account connected")
    disconnect(db, user)
    return {"status": "disconnected"}
