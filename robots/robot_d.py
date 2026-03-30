"""Robot D — Receiver.

Waits for handover from carrier, signs a receipt, broadcasts confirmation via Gossipsub.
"""

import hashlib
import json
import time
from robots.shared.p2p_client import P2PClient
from robots.shared.logger import log_event


class RobotD:
    def __init__(self, p2p_port: int = 8004):
        self.p2p = P2PClient(f"http://localhost:{p2p_port}")
        self.info = self.p2p.get_id()
        self.peer_id = self.info["peer_id"]

    def wait_for_handover(self, timeout: int = 60) -> dict:
        """Poll inbox for handover from carrier."""
        print("[Robot D] Waiting at destination for delivery...")
        start = time.time()
        while time.time() - start < timeout:
            messages = self.p2p.inbox()
            for msg in messages:
                if msg["type"] == "direct":
                    try:
                        payload = json.loads(msg["payload"])
                        if payload.get("type") == "handover":
                            print(f"[Robot D] Received handover: {payload['cargo']} from {payload['from']}")
                            log_event("handover_received", cargo=payload["cargo"], from_robot=payload["from"])
                            return payload
                    except json.JSONDecodeError:
                        pass
            time.sleep(0.5)
        raise TimeoutError("No handover received")

    def sign_and_broadcast(self, cargo: str) -> str:
        """Generate receipt hash and broadcast delivery confirmation via Gossipsub."""
        receipt_data = f"{cargo}:{self.peer_id}:{time.time()}"
        receipt_hash = hashlib.sha256(receipt_data.encode()).hexdigest()

        print(f"[Robot D] Signed receipt: {receipt_hash[:16]}...")
        log_event("receipt_signed", cargo=cargo, receipt_hash=receipt_hash, signer="robot_d")

        confirmation = json.dumps({
            "type": "delivery_confirmed",
            "cargo": cargo,
            "receipt_hash": receipt_hash,
            "receiver": "robot_d",
            "timestamp": time.time(),
        })
        self.p2p.publish(confirmation, topic="swarm")
        print("[Robot D] Delivery confirmation broadcast to swarm via Gossipsub")
        log_event("gossipsub_broadcast", event="delivery_confirmed", receipt_hash=receipt_hash)

        return receipt_hash
