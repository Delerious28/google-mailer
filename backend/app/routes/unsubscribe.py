from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Lead

router = APIRouter(tags=["unsubscribe"])


@router.get("/unsubscribe/{token}")
def unsubscribe(token: str, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.unsubscribe_token == token).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Token not found")
    lead.unsubscribed = True
    db.commit()
    return {"status": "unsubscribed", "email": lead.email}
