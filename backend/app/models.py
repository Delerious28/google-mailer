import uuid
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .db import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    token_encrypted = Column(Text, nullable=False)


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    consent = Column(Boolean, default=False)
    unsubscribed = Column(Boolean, default=False)
    first_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    unsubscribe_token = Column(String, unique=True, default=lambda: str(uuid.uuid4()))

    logs = relationship("SendLog", back_populates="lead")


class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mail1_subject = Column(String, nullable=False)
    mail1_body = Column(Text, nullable=False)
    mail2_subject = Column(String, nullable=False)
    mail2_body = Column(Text, nullable=False)
    delay_days = Column(Integer, default=3)
    paused = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    logs = relationship("SendLog", back_populates="campaign")


class SendLog(Base):
    __tablename__ = "send_logs"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    step = Column(String, nullable=False)  # mail1 or mail2
    status = Column(String, nullable=False)
    scheduled_at = Column(DateTime)
    sent_at = Column(DateTime)
    message_id = Column(String)
    thread_id = Column(String)
    error = Column(Text)

    lead = relationship("Lead", back_populates="logs")
    campaign = relationship("Campaign", back_populates="logs")


class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(String, default="09:00")
    end_time = Column(String, default="17:00")
    interval_min = Column(Integer, default=3)
    interval_max = Column(Integer, default=6)
    daily_cap = Column(Integer, default=200)
    timezone = Column(String, default="UTC")


class ScheduledSend(Base):
    __tablename__ = "scheduled_sends"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    step = Column(String, nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    status = Column(String, default="queued")

    lead = relationship("Lead")
    campaign = relationship("Campaign")
