from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()


def start_scheduler():
    if not scheduler.running:
        scheduler.start()


def add_interval_job(func, minutes: int = 1):
    scheduler.add_job(func, "interval", minutes=minutes, next_run_time=datetime.utcnow())
