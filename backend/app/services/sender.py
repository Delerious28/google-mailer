import os
import random
from datetime import datetime, timedelta, time
from typing import Dict, List

import pytz
from sqlalchemy.orm import Session

from ..auth_google import current_user, load_credentials
from ..gmail_client import GmailClient
from ..models import Campaign, Lead, ScheduledSend, SendLog, Settings


FOOTER_TEMPLATE = """<p style='margin-top:24px;font-size:12px;color:#666'>You are receiving this email because you have an existing relationship and opted in to communication. If you no longer wish to hear from us, click <a href=\"{unsubscribe_url}\">unsubscribe</a>.</p>"""


def ensure_settings(db: Session) -> Settings:
    settings = db.query(Settings).first()
    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _next_window(base: datetime, start: time, end: time, tz) -> datetime:
    localized = tz.localize(base.replace(tzinfo=None)) if base.tzinfo is None else base.astimezone(tz)
    day_start = localized.replace(hour=start.hour, minute=start.minute, second=0, microsecond=0)
    if localized < day_start:
        return day_start
    day_end = localized.replace(hour=end.hour, minute=end.minute, second=0, microsecond=0)
    if localized > day_end:
        return day_start + timedelta(days=1)
    return localized


def build_body(body_template: str, lead: Lead, unsubscribe_url: str) -> str:
    vars_map: Dict[str, str] = {
        "first_name": lead.first_name or "",
        "email": lead.email,
    }
    content = body_template
    for key, value in vars_map.items():
        content = content.replace(f"{{{{{key}}}}}", value)
    return content + FOOTER_TEMPLATE.format(unsubscribe_url=unsubscribe_url)


def schedule_campaign(db: Session, campaign_id: int, leads: List[Lead]):
    settings = ensure_settings(db)
    tz = pytz.timezone(settings.timezone)
    start_hour, start_min = map(int, settings.start_time.split(":"))
    end_hour, end_min = map(int, settings.end_time.split(":"))
    start_t = time(start_hour, start_min)
    end_t = time(end_hour, end_min)
    now = datetime.now(tz)
    base = _next_window(now, start_t, end_t, tz)

    daily_count = 0
    for lead in leads:
        if not lead.consent or lead.unsubscribed:
            continue
        if daily_count >= settings.daily_cap:
            break
        scheduled_at = base
        base += timedelta(minutes=random.randint(settings.interval_min, settings.interval_max))
        if base.time() > end_t:
            base = _next_window(base + timedelta(days=1), start_t, end_t, tz)
            daily_count = 0
        db.add(
            ScheduledSend(
                lead_id=lead.id,
                campaign_id=campaign_id,
                step="mail1",
                scheduled_at=scheduled_at,
            )
        )
        daily_count += 1
    db.commit()


def enqueue_mail2(db: Session, log: SendLog, delay_days: int):
    settings = ensure_settings(db)
    tz = pytz.timezone(settings.timezone)
    start_hour, start_min = map(int, settings.start_time.split(":"))
    end_hour, end_min = map(int, settings.end_time.split(":"))
    start_t = time(start_hour, start_min)
    end_t = time(end_hour, end_min)

    target = log.sent_at + timedelta(days=delay_days)
    scheduled = _next_window(target, start_t, end_t, tz)
    db.add(
        ScheduledSend(
            lead_id=log.lead_id,
            campaign_id=log.campaign_id,
            step="mail2",
            scheduled_at=scheduled,
        )
    )
    db.commit()


def process_queue(db: Session):
    user = current_user(db)
    if not user:
        return
    creds = load_credentials(user)
    client = GmailClient(creds)
    now = datetime.utcnow()
    queued = (
        db.query(ScheduledSend)
        .filter(ScheduledSend.status == "queued", ScheduledSend.scheduled_at <= now)
        .order_by(ScheduledSend.scheduled_at)
        .all()
    )
    for item in queued:
        lead = db.query(Lead).get(item.lead_id)
        campaign = db.query(Campaign).get(item.campaign_id)
        if not lead or lead.unsubscribed or not lead.consent or (campaign and campaign.paused):
            item.status = "skipped_no_consent"
            db.add(
                SendLog(
                    lead_id=item.lead_id,
                    campaign_id=item.campaign_id,
                    step=item.step,
                    status="skipped_no_consent",
                    scheduled_at=item.scheduled_at,
                )
            )
            db.delete(item)
            db.commit()
            continue

        if item.step == "mail2":
            previous = (
                db.query(SendLog)
                .filter(
                    SendLog.lead_id == lead.id,
                    SendLog.campaign_id == campaign.id,
                    SendLog.step == "mail1",
                    SendLog.status == "sent",
                )
                .order_by(SendLog.sent_at.desc())
                .first()
            )
            if previous and previous.thread_id:
                if client.thread_has_reply(previous.thread_id, lead.email, previous.sent_at):
                    item.status = "skipped_replied"
                    db.add(
                        SendLog(
                            lead_id=item.lead_id,
                            campaign_id=item.campaign_id,
                            step="mail2",
                            status="skipped_replied",
                            scheduled_at=item.scheduled_at,
                        )
                    )
                    db.delete(item)
                    db.commit()
                    continue

        unsubscribe_url = f"{os.environ.get('APP_BASE_URL', 'http://localhost:8000')}/unsubscribe/{lead.unsubscribe_token}"
        subject = campaign.mail1_subject if item.step == "mail1" else campaign.mail2_subject
        body_template = campaign.mail1_body if item.step == "mail1" else campaign.mail2_body
        body = build_body(body_template, lead, unsubscribe_url)
        try:
            sent = client.send_message(user.email, lead.email, subject, body)
            message_id = sent.get("id")
            thread_id = sent.get("threadId")
            log = SendLog(
                lead_id=lead.id,
                campaign_id=campaign.id,
                step=item.step,
                status="sent",
                scheduled_at=item.scheduled_at,
                sent_at=datetime.utcnow(),
                message_id=message_id,
                thread_id=thread_id,
            )
            db.add(log)
            item.status = "sent"
            db.delete(item)
            db.commit()
            if item.step == "mail1":
                enqueue_mail2(db, log, campaign.delay_days)
        except Exception as exc:  # pragma: no cover - best effort
            db.add(
                SendLog(
                    lead_id=lead.id,
                    campaign_id=campaign.id,
                    step=item.step,
                    status="error",
                    scheduled_at=item.scheduled_at,
                    error=str(exc),
                )
            )
            db.commit()
