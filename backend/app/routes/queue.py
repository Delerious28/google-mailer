from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ScheduledSend

router = APIRouter(prefix="/queue", tags=["queue"])


@router.get("")
def list_queue(db: Session = Depends(get_db)):
    return db.query(ScheduledSend).order_by(ScheduledSend.scheduled_at).all()
