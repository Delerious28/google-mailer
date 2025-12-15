import os
import base64
from email.mime.text import MIMEText

from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Load env vars
load_dotenv()
TO_EMAIL = os.getenv("TO_EMAIL")

# Gmail API scope
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

def authenticate():
    creds = None

    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(
            "credentials.json", SCOPES
        )
        creds = flow.run_local_server(port=0)

        with open("token.json", "w") as token:
            token.write(creds.to_json())

    return creds

def send_email():
    creds = authenticate()
    service = build("gmail", "v1", credentials=creds)

    message = MIMEText("This is a test email sent via Gmail API 🚀")
    message["to"] = TO_EMAIL
    message["subject"] = "Gmail API Test Email"

    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()

    service.users().messages().send(
        userId="me",
        body={"raw": raw}
    ).execute()

    print(f"✅ Email sent to {TO_EMAIL}")

if __name__ == "__main__":
    send_email()
