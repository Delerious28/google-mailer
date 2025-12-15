import uvicorn

from backend.app.main import app


# Recommended usage:
# To enable 'reload' or 'workers', run from the command line:
#   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
# Running this file directly with 'reload=True' will show a warning from uvicorn.

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
