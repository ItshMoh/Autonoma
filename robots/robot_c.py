"""Robot C — Independent Worker.

Listens for passage negotiation requests and yields based on priority comparison.
"""

import json
import time
from robots.shared.p2p_client import P2PClient
from robots.shared.logger import log_event
from robots.shared import gz_mover


class RobotC:
    def __init__(self, p2p_port: int = 8004):
        self.p2p = P2PClient(f"http://localhost:{p2p_port}")
        self.info = self.p2p.get_id()
        self.peer_id = self.info["peer_id"]
        self.own_priority = 0  # no cargo

    def listen_for_negotiation(self, timeout: int = 60) -> dict:
        """Poll inbox for a passage negotiation request."""
        print(f"[Robot C] Patrolling toward passage... (priority: {self.own_priority}, no cargo)")
        # Start moving C toward passage in background
        import threading
        move_thread = threading.Thread(target=gz_mover.navigate_c_toward_passage)
        move_thread.start()
        start = time.time()
        while time.time() - start < timeout:
            messages = self.p2p.inbox()
            for msg in messages:
                if msg["type"] == "direct":
                    try:
                        payload = json.loads(msg["payload"])
                        if payload.get("type") == "passage_negotiation":
                            return self._handle_negotiation(msg["from"], payload)
                    except json.JSONDecodeError:
                        pass
            time.sleep(0.5)
        return {"action": "timeout"}

    def _handle_negotiation(self, from_peer: str, payload: dict) -> dict:
        """Compare priorities and decide whether to yield."""
        their_priority = payload.get("priority", 0)
        print(f"[Robot C] Negotiation from {payload['robot']}: priority={their_priority}, cargo={payload['cargo']}")
        print(f"[Robot C] My priority: {self.own_priority}")

        if their_priority > self.own_priority:
            print("[Robot C] Their priority is higher. Yielding...")
            gz_mover.move_to_yield_zone("robot_c")
            yield_msg = json.dumps({
                "type": "yield_ack",
                "robot": "robot_c",
                "reason": f"priority {their_priority} > {self.own_priority}",
            })
            self.p2p.send(from_peer, yield_msg)
            log_event(
                "yield_decision",
                yielder="robot_c",
                yielder_priority=self.own_priority,
                winner=payload["robot"],
                winner_priority=their_priority,
                outcome="C_yields",
            )
            print("[Robot C] In yield zone. Staying put.")
            return {"action": "yielded", "to": payload["robot"]}
        else:
            print("[Robot C] My priority is equal or higher. Holding position.")
            hold_msg = json.dumps({
                "type": "hold",
                "robot": "robot_c",
                "priority": self.own_priority,
            })
            self.p2p.send(from_peer, hold_msg)
            return {"action": "held"}
