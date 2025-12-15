import os
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from . import models
from .db import Base, engine, get_db, SessionLocal
from .scheduler import add_interval_job, start_scheduler
from .services.sender import ensure_settings, process_queue
from .routes import auth, leads, campaigns, settings, logs, queue, unsubscribe

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mailer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(leads.router, prefix="/api")
app.include_router(campaigns.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(queue.router, prefix="/api")
app.include_router(unsubscribe.router)


# Serve frontend build
frontend_dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/dist'))
assets_path = os.path.join(frontend_dist_path, 'assets')
if os.path.isdir(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")


@app.get("/")
async def serve_index():
    index_path = os.path.join(frontend_dist_path, 'index.html')
    return FileResponse(index_path)


@app.get("/{full_path:path}")
async def serve_catch_all(full_path: str, request: Request):
    if full_path.startswith("api/"):
        return {"detail": "Not Found"}
    index_path = os.path.join(frontend_dist_path, 'index.html')
    return FileResponse(index_path)


def _tick_queue():
    db = SessionLocal()
    try:
        process_queue(db)
    finally:
        db.close()


@app.on_event("startup")
def startup_event():
    start_scheduler()
    add_interval_job(_tick_queue, minutes=1)


@app.get("/health")
def health(db: Session = Depends(get_db)):
    ensure_settings(db)
    return {"status": "ok"}
