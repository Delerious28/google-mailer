import base64
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials


class GmailClient:
    def __init__(self, credentials: Credentials):
        self.credentials = credentials

    def send_message(self, sender: str, to: str, subject: str, body_html: str):
        message = MIMEMultipart("alternative")
        message["To"] = to
        message["From"] = sender
        message["Subject"] = subject
        message.attach(MIMEText(body_html, "html"))

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        try:
            service = build("gmail", "v1", credentials=self.credentials)
            sent = service.users().messages().send(userId="me", body={"raw": raw}).execute()
            return sent
        except HttpError as exc:
            raise RuntimeError(f"Gmail API error: {exc}")

    def thread_has_reply(self, thread_id: str, lead_email: str, sent_at) -> bool:
        service = build("gmail", "v1", credentials=self.credentials)
        thread = service.users().threads().get(userId="me", id=thread_id).execute()
        messages = thread.get("messages", [])
        for m in messages:
            headers = m.get("payload", {}).get("headers", [])
            header_dict = {h["name"].lower(): h["value"] for h in headers}
            from_header = header_dict.get("from", "")
            internal_date = int(m.get("internalDate", "0")) / 1000
            if internal_date > sent_at.timestamp() and lead_email.lower() in from_header.lower():
                return True
        return False
