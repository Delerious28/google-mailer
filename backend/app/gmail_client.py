import base64
import os
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders
from typing import List, Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials


class GmailClient:
    def __init__(self, credentials: Credentials):
        self.credentials = credentials

    def send_message(
        self,
        sender: str,
        to: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None,
        attachments: Optional[List[dict]] = None,
    ):
        base_message = MIMEMultipart("alternative")
        if body_text:
            base_message.attach(MIMEText(body_text, "plain"))
        base_message.attach(MIMEText(body_html, "html"))

        message = MIMEMultipart("mixed")
        message["To"] = to
        message["From"] = sender
        message["Subject"] = subject
        message.attach(base_message)

        for attachment in attachments or []:
            path = attachment.get("path")
            if not path or not os.path.exists(path):
                continue
            part = MIMEBase("application", "octet-stream")
            with open(path, "rb") as f:
                part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={attachment.get('filename')}")
            message.attach(part)

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
