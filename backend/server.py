"""FastAPI server — exposes cli.py mission flow as SSE stream."""

import sys
import os
import json
import asyncio
from threading import Thread

# Add project root so we can import robots/shared/openrouter etc.
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from dotenv import load_dotenv
load_dotenv(os.path.join(ROOT, ".env"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from robots.shared.openrouter import parse_task
from backend.mission_runner import run_mission_stream

app = FastAPI(title="Sovereign Swarm API")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track whether a mission is currently running
mission_running = False


class CommandRequest(BaseModel):
    command: str


class TaskRequest(BaseModel):
    task: dict


@app.get("/api/status")
def status():
    return {"status": "running" if mission_running else "idle"}


@app.post("/api/parse")
def parse_command(req: CommandRequest):
    """Parse a natural language command into a structured task via OpenRouter."""
    try:
        task = parse_task(req.command)
        return {"task": task}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse failed: {e}")


@app.post("/api/mission/start")
async def start_mission(req: TaskRequest):
    """Start a mission and stream events via SSE."""
    global mission_running

    if mission_running:
        raise HTTPException(status_code=409, detail="A mission is already running")

    task = req.task

    # Validate required fields
    required = ["sender", "receiver", "cargo", "priority", "description"]
    missing = [f for f in required if f not in task]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing fields: {missing}")

    async def event_generator():
        global mission_running
        mission_running = True

        # Run the blocking generator in a thread, push events via asyncio queue
        queue: asyncio.Queue = asyncio.Queue()
        loop = asyncio.get_event_loop()

        def run_in_thread():
            try:
                for event in run_mission_stream(task):
                    asyncio.run_coroutine_threadsafe(queue.put(event), loop)
                # Signal completion
                asyncio.run_coroutine_threadsafe(queue.put(None), loop)
            except Exception as e:
                error_evt = {"type": "error", "text": f"Mission failed: {e}", "event": "mission_failed", "metadata": {"error": str(e)}}
                asyncio.run_coroutine_threadsafe(queue.put(error_evt), loop)
                asyncio.run_coroutine_threadsafe(queue.put(None), loop)

        thread = Thread(target=run_in_thread, daemon=True)
        thread.start()

        try:
            while True:
                event = await queue.get()
                if event is None:
                    break
                yield {"data": json.dumps(event)}
        finally:
            mission_running = False

    return EventSourceResponse(event_generator())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8080, reload=True)
