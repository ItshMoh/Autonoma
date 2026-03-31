"""Generates an AI audit summary of mission_trace.jsonl via OpenRouter."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

from robots.shared.openrouter import chat

TRACE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "mission_trace.jsonl",
)

SYSTEM_PROMPT = """You are an audit reporter for an autonomous robot swarm delivery system.
Given a mission event log in JSONL format, produce a concise human-readable audit report.
Cover: what was delivered, which robots participated, how the narrow passage negotiation was resolved,
delivery confirmation, on-chain payment status, and Filecoin archival.
Be factual, structured, and under 200 words."""


def summarize_mission(trace_file: str = TRACE_FILE) -> str:
    with open(trace_file, "r") as f:
        trace_lines = f.read().strip()
    return chat(SYSTEM_PROMPT, f"Mission log:\n{trace_lines}")


if __name__ == "__main__":
    print(summarize_mission())
