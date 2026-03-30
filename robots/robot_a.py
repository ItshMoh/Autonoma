"""Robot A — Requester/Sender.

Receives a structured task, discovers a carrier via DHT, assigns the task,
and waits for delivery confirmation via Gossipsub.
"""

import json
import time
from robots.shared.p2p_client import P2PClient
from robots.shared.logger import log_event


class RobotA:
    def __init__(self, p2p_port: int = 8001):
        self.p2p = P2PClient(f"http://localhost:{p2p_port}")
        self.info = self.p2p.get_id()
        self.peer_id = self.info["peer_id"]

    def assign_task(self, task: dict) -> str:
        """Find a carrier and assign the delivery task. Returns carrier peer ID."""
        print(f"[Robot A] Task received: {task['description']}")
        log_event("task_created", **task)

        # Discover a carrier via DHT
        print("[Robot A] Querying DHT for carrier...")
        peers = self.p2p.find_peer("carrier")
        if not peers:
            print("[Robot A] No carrier found! Retrying in 2s...")
            time.sleep(2)
            peers = self.p2p.find_peer("carrier")
        if not peers:
            raise RuntimeError("No carrier peer found in DHT")

        carrier = peers[0]
        carrier_id = carrier["peer_id"]
        print(f"[Robot A] Found carrier: {carrier_id[:16]}...")
        log_event("peer_discovered", robot_a=self.peer_id, carrier=carrier_id)

        # Send task assignment to carrier
        task_msg = json.dumps({"type": "task_assignment", **task})
        self.p2p.send(carrier_id, task_msg)
        print(f"[Robot A] Task assigned to carrier")
        log_event("task_assigned", carrier=carrier_id, cargo=task["cargo"])

        return carrier_id

    def wait_for_confirmation(self, timeout: int = 60) -> dict:
        """Poll inbox for delivery confirmation from Gossipsub."""
        print("[Robot A] Waiting for delivery confirmation...")
        start = time.time()
        while time.time() - start < timeout:
            messages = self.p2p.inbox()
            for msg in messages:
                if msg["type"] == "gossip" and "delivery_confirmed" in msg["payload"]:
                    print(f"[Robot A] Delivery confirmed!")
                    confirmation = json.loads(msg["payload"])
                    log_event("delivery_confirmed_received", **confirmation)
                    return confirmation
            time.sleep(1)
        raise TimeoutError("No delivery confirmation received")
