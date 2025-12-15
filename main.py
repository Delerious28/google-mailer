import uvicorn

from backend.app.main import app


if __name__ == "__main__":
    # Use import string for reload to work properly
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
