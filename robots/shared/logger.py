"""Appends mission events to mission_trace.jsonl."""

import json
import time
import os

TRACE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "mission_trace.jsonl",
)


def log_event(event: str, **kwargs):
    entry = {"event": event, "ts": time.time(), **kwargs}
    with open(TRACE_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
    return entry
