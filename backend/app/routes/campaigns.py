from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Campaign, Lead
from ..services.sender import schedule_campaign

router = APIRouter(prefix="/campaigns", tags=["campaigns"])


@router.post("")
def create_campaign(payload: dict, db: Session = Depends(get_db)):
    campaign = Campaign(**payload)
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    leads = db.query(Lead).all()
    schedule_campaign(db, campaign.id, leads)
    return campaign


@router.get("")
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(Campaign).all()


@router.post("/{campaign_id}/pause")
def pause_campaign(campaign_id: int, pause: bool, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).get(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign.paused = pause
    db.commit()
    return {"status": "updated"}
