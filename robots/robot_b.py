"""Robot B — Carrier.

Announces carrier capability, receives task, moves through the arena,
negotiates at narrow passage, delivers to receiver.
"""

import json
import time
from robots.shared.p2p_client import P2PClient
from robots.shared.logger import log_event
from robots.shared import gz_mover


class RobotB:
    def __init__(self, p2p_port: int = 8002):
        self.p2p = P2PClient(f"http://localhost:{p2p_port}")
        self.info = self.p2p.get_id()
        self.peer_id = self.info["peer_id"]
        self.current_task = None

    def announce_carrier(self):
        """Register as a carrier in the DHT."""
        self.p2p.announce("carrier")
        print("[Robot B] Announced carrier capability in DHT")

    def wait_for_task(self, timeout: int = 30) -> dict:
        """Poll inbox for task assignment from Robot A."""
        print("[Robot B] Waiting for task assignment...")
        start = time.time()
        while time.time() - start < timeout:
            messages = self.p2p.inbox()
            for msg in messages:
                if msg["type"] == "direct":
                    try:
                        payload = json.loads(msg["payload"])
                        if payload.get("type") == "task_assignment":
                            self.current_task = payload
                            print(f"[Robot B] Task received: {payload.get('description', 'delivery')}")
                            log_event("task_accepted", carrier=self.peer_id, cargo=payload["cargo"])
                            return payload
                    except json.JSONDecodeError:
                        pass
            time.sleep(0.5)
        raise TimeoutError("No task assignment received")

    def navigate_to_passage(self):
        """Move toward the narrow passage in Gazebo."""
        print("[Robot B] Navigating toward narrow passage...")
        gz_mover.navigate_b_to_passage()
        print("[Robot B] Reached narrow passage area")
        log_event("reached_passage", robot="robot_b")

    def negotiate_passage(self, robot_c_peer_id: str) -> bool:
        """Send priority metadata to Robot C and wait for yield acknowledgement."""
        print(f"[Robot B] Negotiating passage with Robot C...")
        priority_msg = json.dumps({
            "type": "passage_negotiation",
            "robot": "robot_b",
            "cargo": self.current_task["cargo"],
            "priority": self.current_task["priority"],
        })
        self.p2p.send(robot_c_peer_id, priority_msg)
        log_event(
            "narrow_passage_negotiation",
            robot_b_priority=self.current_task["priority"],
            initiator="robot_b",
        )

        # Wait for yield ack
        print("[Robot B] Waiting for Robot C to yield...")
        start = time.time()
        while time.time() - start < 15:
            messages = self.p2p.inbox()
            for msg in messages:
                if msg["type"] == "direct":
                    try:
                        payload = json.loads(msg["payload"])
                        if payload.get("type") == "yield_ack":
                            print("[Robot B] Robot C yielded! Passing through.")
                            gz_mover.navigate_b_through_passage()
                            log_event("passage_cleared", winner="robot_b", yielder="robot_c")
                            return True
                    except json.JSONDecodeError:
                        pass
            time.sleep(0.5)
        print("[Robot B] No yield received, forcing through")
        return False

    def deliver_to_receiver(self, receiver_peer_id: str):
        """Navigate to receiver and hand over the cargo."""
        print("[Robot B] Navigating to receiver (Robot D)...")
        gz_mover.navigate_b_to_d()
        print("[Robot B] Reached Robot D, initiating handover...")

        handover_msg = json.dumps({
            "type": "handover",
            "cargo": self.current_task["cargo"],
            "priority": self.current_task["priority"],
            "from": "robot_b",
        })
        self.p2p.send(receiver_peer_id, handover_msg)
        print("[Robot B] Handover sent to Robot D")
        log_event("handover_sent", carrier="robot_b", receiver="robot_d", cargo=self.current_task["cargo"])
