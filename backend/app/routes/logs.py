from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import SendLog

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("")
def list_logs(campaign_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(SendLog)
    if campaign_id:
        q = q.filter(SendLog.campaign_id == campaign_id)
    return q.order_by(SendLog.id.desc()).limit(500).all()
