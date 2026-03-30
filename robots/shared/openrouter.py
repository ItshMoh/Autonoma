"""OpenRouter API client for task parsing and AI calls."""

import json
import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"))

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-3.1-flash-lite-preview"


def chat(system_prompt: str, user_message: str, model: str = MODEL) -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost",
        "X-OpenRouter-Title": "Sovereign Swarm",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.1,
    }
    r = requests.post(OPENROUTER_URL, headers=headers, data=json.dumps(payload), timeout=30)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


def parse_task(natural_language_command: str) -> dict:
    system_prompt = """You are a task parser for a robot swarm delivery system.
Given a natural language delivery command, extract the structured task.

The system has 4 stations/robots:
- robot_a: Sender station (top-left)
- robot_d: Receiver station (bottom-right)

The carrier robot is NOT predetermined — it will be discovered via P2P DHT at runtime.
Do NOT include a "carrier" field.

Priority levels: 1 (low), 2 (medium), 3 (high)

Respond ONLY with valid JSON, no markdown, no explanation:
{"sender": "robot_a", "receiver": "robot_d", "cargo": "string", "priority": number, "description": "string"}
"""
    response = chat(system_prompt, natural_language_command)
    # Strip markdown fences if present
    response = response.strip()
    if response.startswith("```"):
        response = response.split("\n", 1)[1]
        response = response.rsplit("```", 1)[0]
    return json.loads(response.strip())
