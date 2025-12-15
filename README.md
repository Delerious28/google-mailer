# Mailer

Mailer is a small permission-based email campaign tool built on FastAPI, React, and the Gmail API. It uses the official Gmail API (no SMTP) to send one-to-one emails from a connected Google account and enforces consent, unsubscribe handling, pacing, and reply-aware follow-ups.

## Features
- Google OAuth2 (offline access) storing encrypted refresh tokens (loads client_secret*.json in project root automatically).
- Upload leads (CSV with `email`, `consent`, optional `first_name`). Consent is required to send.
- Campaigns with Mail 1 and Mail 2 templates; Mail 2 sends after a delay only if no reply was detected in the Gmail thread.
- Randomized pacing between sends, daily cap, allowed-hour window, and timezone setting.
- APScheduler-based background job that sends queued messages and checks replies before Mail 2.
- Unsubscribe tokens and suppression: every email footer includes a unique unsubscribe link; unsubscribed leads are never sent again.
- Dark UI with animated page transitions; frontend is built with Vite and served by FastAPI.

## Prerequisites
- Python 3.11+
- Node.js 18+
- Google Cloud project with Gmail API enabled.

## Google Cloud setup
1. Enable the **Gmail API** in your Google Cloud project.
2. Configure the OAuth consent screen (External/Internal) and add your test users.
3. Create OAuth client credentials (Web application) and set the redirect URI to `http://localhost:8000/api/auth/callback`.
4. Download the client secret JSON and place it in the repo root (any `client_secret*.json` name works). The backend reads it automatically; environment variables are only used if no JSON is found.

## Configuration
- If you use a client_secret JSON file, no Google OAuth env vars are required. Without the file, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and optionally `GOOGLE_REDIRECT_URI`.
- An encryption key is required to store tokens; set `ENCRYPTION_KEY` or let the app create `encryption_key.txt` automatically at first run.
- Optional `.env` at project root:
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/callback
ENCRYPTION_KEY=<32-byte base64 key>
DATABASE_URL=sqlite:///./mailer.db
APP_BASE_URL=http://localhost:8000
TZ=UTC
```
If `ENCRYPTION_KEY` is missing, the app will generate `encryption_key.txt` in the repo root and reuse it on subsequent runs.

## Backend (FastAPI)
1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Build the frontend (served by FastAPI):
   ```bash
   cd ../frontend
   npm install
   npm run build
   cd ..
   ```
3. Run the app from the repo root (uses uvicorn with reload):
   ```bash
   python main.py
   ```
   Or run uvicorn directly if preferred:
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
4. The API lives under `/api`; the built frontend is served at `/` and `/assets`. Unsubscribe links are handled at `/unsubscribe/{token}`.

## Frontend (Vite + React + Tailwind)
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Development server (optional while editing UI):
   ```bash
   npm run dev -- --host --port 5173
   ```
3. Production build (served by FastAPI):
   ```bash
   npm run build
   ```
4. The app expects the backend at `http://localhost:8000`. Set `VITE_API_BASE` in `frontend/.env` if you need a different API origin.

## Compliance notes
- The UI enforces consent per lead and marks unsubscribed contacts so they will never be mailed again.
- Every outgoing email appends an unsubscribe link and a reason footer.
- Sending uses Gmail API `users.messages.send`; messages are scheduled one by one with random intervals and within the allowed time window.
- Mail 2 is queued only after Mail 1 and is skipped if a reply from the lead is detected.
- Daily cap and pacing settings can be tuned in the Settings page.

## Development notes
- APScheduler runs in-process for development. The scheduling logic is isolated in `backend/app/services/sender.py` so it can be replaced with a distributed worker later.
- Tokens are stored encrypted at rest using `ENCRYPTION_KEY`. Tokens are never logged.
