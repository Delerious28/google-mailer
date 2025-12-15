# Mailer

Mailer is a small permission-based email campaign tool built on FastAPI, React, and the Gmail API. It uses the official Gmail API (no SMTP) to send one-to-one emails from a connected Google account and enforces consent, unsubscribe handling, pacing, and reply-aware follow-ups.

## Features
- Google OAuth2 (offline access) storing encrypted refresh tokens.
- Upload leads (CSV with `email`, `consent`, optional `first_name`). Consent is required to send.
- Campaigns with Mail 1 and Mail 2 templates; Mail 2 sends after a delay only if no reply was detected in the Gmail thread.
- Randomized pacing between sends, daily cap, allowed-hour window, and timezone setting.
- APScheduler-based background job that sends queued messages and checks replies before Mail 2.
- Unsubscribe tokens and suppression: every email footer includes a unique unsubscribe link; unsubscribed leads are never sent again.
- Logging UI for queued/sent/skipped/replied/error events.

## Prerequisites
- Python 3.11+
- Node.js 18+
- Google Cloud project with Gmail API enabled.

## Google Cloud setup
1. Enable the **Gmail API** in your Google Cloud project.
2. Configure the OAuth consent screen (External/Internal) and add your test users.
3. Create OAuth client credentials (Web application) and set the redirect URI to `http://localhost:8000/api/auth/callback`.
4. Copy the Client ID and Client Secret into your `.env` file.

## Configuration
Create a `.env` file at the project root based on `.env.example`:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
ENCRYPTION_KEY=<32-byte base64 key from `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`>
DATABASE_URL=sqlite:///./mailer.db
APP_BASE_URL=http://localhost:8000
TZ=UTC
```

## Backend (FastAPI)
1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install fastapi uvicorn[standard] sqlalchemy google-auth google-auth-oauthlib google-api-python-client cryptography apscheduler pytz
   ```
2. Run the API:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
3. The API exposes endpoints under `/api`, plus `/unsubscribe/{token}` for suppression handling.

## Frontend (Vite + React + Tailwind)
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev -- --host --port 5173
   ```
3. The app expects the backend at `http://localhost:8000`. You can set `VITE_API_BASE` in a `.env` file under `frontend` if needed.

## Compliance notes
- The UI enforces consent per lead and marks unsubscribed contacts so they will never be mailed again.
- Every outgoing email appends an unsubscribe link and a reason footer.
- Sending uses Gmail API `users.messages.send`; messages are scheduled one by one with random intervals and within the allowed time window.
- Mail 2 is queued only after Mail 1 and is skipped if a reply from the lead is detected.
- Daily cap and pacing settings can be tuned in the Settings page.

## Development notes
- APScheduler runs in-process for development. The scheduling logic is isolated in `backend/app/services/sender.py` so it can be replaced with a distributed worker later.
- Tokens are stored encrypted at rest using `ENCRYPTION_KEY`. Tokens are never logged.
