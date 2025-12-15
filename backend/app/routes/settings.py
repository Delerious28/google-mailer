from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Settings
from ..services.sender import ensure_settings

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def read_settings(db: Session = Depends(get_db)):
    return ensure_settings(db)


@router.post("")
def update_settings(payload: dict, db: Session = Depends(get_db)):
    settings = ensure_settings(db)
    for key, value in payload.items():
        if hasattr(settings, key):
            setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
