import csv
from io import StringIO
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Lead

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("/upload")
def upload_leads(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = file.file.read().decode()
    reader = csv.DictReader(StringIO(content))
    required = {"email", "consent"}
    if not required.issubset(set(reader.fieldnames or [])):
        raise HTTPException(status_code=400, detail="CSV must include email and consent columns")
    created = 0
    for row in reader:
        email = row.get("email", "").strip().lower()
        consent = str(row.get("consent", "")).lower() in {"true", "1", "yes"}
        first_name = row.get("first_name")
        if not email:
            continue
        lead = db.query(Lead).filter(Lead.email == email).first()
        if lead:
            lead.consent = consent
            lead.first_name = first_name
        else:
            lead = Lead(email=email, consent=consent, first_name=first_name)
            db.add(lead)
        created += 1
    db.commit()
    return {"count": created}


@router.get("")
def list_leads(db: Session = Depends(get_db)):
    leads = db.query(Lead).all()
    return leads


@router.post("/{lead_id}/consent")
def update_consent(lead_id: int, consent: bool, db: Session = Depends(get_db)):
    lead = db.query(Lead).get(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.consent = consent
    db.commit()
    return {"status": "updated"}
