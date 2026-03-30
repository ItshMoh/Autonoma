"""HTTP client to talk to the local go-libp2p sidecar daemon."""

import requests


class P2PClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def get_id(self) -> dict:
        r = requests.get(f"{self.base_url}/id")
        r.raise_for_status()
        return r.json()

    def announce(self, capability: str) -> dict:
        r = requests.post(f"{self.base_url}/announce", params={"cap": capability})
        r.raise_for_status()
        return r.json()

    def find_peer(self, capability: str) -> list:
        r = requests.get(f"{self.base_url}/find-peer", params={"cap": capability})
        r.raise_for_status()
        data = r.json()
        return data.get("peers") or []

    def send(self, peer_id: str, message: str) -> dict:
        r = requests.post(
            f"{self.base_url}/send",
            json={"peer": peer_id, "message": message},
        )
        r.raise_for_status()
        return r.json()

    def publish(self, message: str, topic: str = "swarm") -> dict:
        r = requests.post(
            f"{self.base_url}/publish",
            json={"topic": topic, "message": message},
        )
        r.raise_for_status()
        return r.json()

    def inbox(self) -> list:
        r = requests.get(f"{self.base_url}/inbox")
        r.raise_for_status()
        data = r.json()
        return data.get("messages") or []
