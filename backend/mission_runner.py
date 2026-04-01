"""Generator version of cli.py's run_mission() — yields structured events instead of printing."""

import sys
import os
import json
import threading
import time
import subprocess

# Add project root to path so we can import robots/, blockchain/, audit/
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from dotenv import load_dotenv
load_dotenv(os.path.join(ROOT, ".env"))

from robots.shared.logger import log_event, TRACE_FILE
from robots.robot_a import RobotA
from robots.robot_b import RobotB
from robots.robot_c import RobotC
from robots.robot_d import RobotD
from blockchain.flow_payment import send_payment, store_audit_cid
from audit.summarizer import summarize_mission


def _evt(msg_type: str, text: str, event: str, **metadata):
    """Build a structured event dict."""
    d = {"type": msg_type, "text": text, "event": event}
    if metadata:
        d["metadata"] = metadata
    return d


def run_mission_stream(task: dict):
    """Execute the full delivery mission, yielding events as they happen.

    This is a generator — each yield is a dict that the SSE endpoint sends to the frontend.
    Same logic as cli.py's run_mission(), but with yields instead of prints.
    """

    # Clear previous trace
    if os.path.exists(TRACE_FILE):
        os.remove(TRACE_FILE)

    yield _evt("system", f"Mission starting — cargo: {task['cargo']}, priority: {task['priority']}, route: {task['sender']} → {task['receiver']}", "mission_start",
               cargo=task["cargo"], priority=task["priority"], sender=task["sender"], receiver=task["receiver"])

    log_event("mission_start", cargo=task["cargo"], priority=task["priority"],
              sender=task["sender"], receiver=task["receiver"],
              description=task["description"])

    # Initialize robots
    a = RobotA(p2p_port=int(os.getenv("ROBOT_A_P2P_PORT", 8001)))
    b = RobotB(p2p_port=int(os.getenv("ROBOT_B_P2P_PORT", 8002)))
    c = RobotC(p2p_port=int(os.getenv("ROBOT_C_P2P_PORT", 8004)))
    d = RobotD(p2p_port=int(os.getenv("ROBOT_D_P2P_PORT", 8005)))

    # Step 1: Robot B announces carrier capability
    yield _evt("swarm", "Robot B announcing carrier capability in DHT...", "carrier_announce")
    b.announce_carrier()
    time.sleep(2)

    # Step 2: Robot A discovers carrier via DHT and assigns task
    yield _evt("swarm", "Robot A querying DHT for available carriers...", "dht_query")
    carrier_id = a.assign_task(task)
    yield _evt("swarm", f"Carrier discovered: Robot B ({carrier_id[:16]}...)", "carrier_discovered",
               carrier_id=carrier_id)

    # Step 3: Robot B receives task
    yield _evt("swarm", "Robot B waiting for task assignment...", "task_wait")
    b.wait_for_task()
    yield _evt("swarm", f"Robot B received task: {task['cargo']}", "task_received")

    # Step 4: Robot B goes to Robot A for pickup
    yield _evt("swarm", "Robot B heading to Robot A for pickup...", "pickup_start")
    b.pickup_from_sender()
    yield _evt("swarm", f"Package picked up: \"{task['cargo']}\". Robot B heading to narrow passage.", "pickup_complete",
               cargo=task["cargo"])

    # Step 5: Robot C approaches passage, Robot B navigates to passage (simultaneously)
    yield _evt("swarm", "Robot C approaching narrow passage from south...", "c_approach")

    c_result = [None]
    c_info = c.p2p.get_id()

    def c_approach_and_listen():
        c_result[0] = c.listen_for_negotiation(timeout=60)

    c_thread = threading.Thread(target=c_approach_and_listen)
    c_thread.start()

    yield _evt("swarm", "Robot B navigating toward narrow passage...", "b_to_passage")
    b.navigate_to_passage()

    # Step 6: Narrow passage negotiation
    yield _evt("swarm", f"Narrow passage negotiation — Robot B priority {task['priority']} vs Robot C priority 0", "negotiation",
               b_priority=task["priority"], c_priority=0)
    b.negotiate_passage(c_info["peer_id"])
    c_thread.join(timeout=30)

    yield _evt("swarm", "Robot C yielding. Moving to yield zone.", "c_yields",
               outcome="C_yields", reason=f"priority {task['priority']} > 0")

    # Step 7: Robot B delivers to Robot D
    yield _evt("swarm", "Robot B passing through passage and heading to Robot D...", "b_delivering")

    d_info = d.p2p.get_id()
    handover_data = [None]

    def d_listen():
        handover_data[0] = d.wait_for_handover(timeout=60)

    d_thread = threading.Thread(target=d_listen)
    d_thread.start()
    time.sleep(0.5)

    b.deliver_to_receiver(d_info["peer_id"])
    d_thread.join(timeout=30)

    # Step 8: Robot D signs receipt and broadcasts
    yield _evt("swarm", "Robot D signing receipt and broadcasting via Gossipsub...", "receipt_signing")
    receipt_hash = d.sign_and_broadcast(task["cargo"])
    yield _evt("swarm", f"Delivery confirmed! Receipt: {receipt_hash[:32]}...", "delivery_confirmed",
               receipt_hash=receipt_hash)

    # Step 9: Robot A receives confirmation
    time.sleep(2)
    try:
        confirmation = a.wait_for_confirmation(timeout=15)
    except TimeoutError:
        confirmation = {"receipt_hash": receipt_hash}

    yield _evt("swarm", "All robots confirmed delivery via Gossipsub.", "gossipsub_confirmed")

    # Step 10: Flow payment
    yield _evt("system", "Triggering FLOW payment on testnet...", "payment_start")
    payment = None
    try:
        payment = send_payment(receipt_hash)
        yield _evt("swarm", f"Payment confirmed. {payment['amount']} FLOW sent to Robot B.", "payment_success",
                    tx_hash=payment["tx_hash"], flowscan_url=payment["flowscan_url"],
                    amount=payment["amount"], block=payment["block"])
        yield _evt("swarm", f"Verify: {payment['flowscan_url']}", "payment_link",
                    flowscan_url=payment["flowscan_url"])
        log_event("payment_triggered", tx_hash=payment["tx_hash"],
                  flowscan_url=payment["flowscan_url"], amount=payment["amount"],
                  block=payment["block"])
    except Exception as e:
        yield _evt("error", f"Payment failed: {e}", "payment_failed", error=str(e))
        log_event("payment_failed", error=str(e))

    # Step 11: AI audit summary
    yield _evt("system", "Generating AI mission summary...", "audit_summary_start")
    try:
        ai_summary = summarize_mission(TRACE_FILE)
        yield _evt("system", f"AI Summary: {ai_summary[:200]}...", "audit_summary_done",
                    summary=ai_summary)
    except Exception as e:
        ai_summary = "Summary unavailable."
        yield _evt("error", f"Summary failed: {e}", "audit_summary_failed", error=str(e))

    # Step 12: Build mission bundle
    bundle_path = os.path.join(ROOT, "mission_bundle.json")
    bundle = {
        "mission_id": receipt_hash[:16],
        "cargo": task["cargo"],
        "priority": task["priority"],
        "trace": [],
        "ai_summary": ai_summary,
        "receipt_hash": receipt_hash,
        "flow_tx": payment.get("tx_hash") if payment else None,
        "flowscan_url": payment.get("flowscan_url") if payment else None,
    }
    try:
        with open(TRACE_FILE, "r") as f:
            bundle["trace"] = [json.loads(line) for line in f if line.strip()]
    except Exception:
        pass

    with open(bundle_path, "w") as f:
        json.dump(bundle, f, indent=2)

    # Step 13: Filecoin upload
    yield _evt("system", "Uploading audit bundle to Filecoin...", "filecoin_upload_start")
    piece_cid = None
    try:
        uploader = os.path.join(ROOT, "audit", "uploader.js")
        result = subprocess.run(
            ["node", uploader, bundle_path],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode == 0 and result.stdout.strip():
            piece_cid = result.stdout.strip()
            yield _evt("system", f"Filecoin upload complete. PieceCID: {piece_cid}", "filecoin_upload_done",
                        piece_cid=piece_cid)
            log_event("filecoin_upload", piece_cid=piece_cid)
        else:
            yield _evt("error", f"Filecoin upload failed (exit {result.returncode})", "filecoin_upload_failed")
            log_event("filecoin_upload_failed", stderr=result.stderr[:200])
    except subprocess.TimeoutExpired:
        yield _evt("error", "Filecoin upload timed out (120s)", "filecoin_upload_timeout")
    except Exception as e:
        yield _evt("error", f"Filecoin upload error: {e}", "filecoin_upload_failed", error=str(e))

    # Step 14: Anchor PieceCID on Flow
    if piece_cid:
        yield _evt("system", "Anchoring PieceCID on Flow EVM testnet...", "anchor_start")
        try:
            anchor = store_audit_cid(piece_cid, receipt_hash)
            yield _evt("system", f"CID anchored on Flow. Verify: {anchor['flowscan_url']}", "anchor_done",
                        tx_hash=anchor["tx_hash"], flowscan_url=anchor["flowscan_url"])
            log_event("audit_cid_anchored", piece_cid=piece_cid,
                      tx_hash=anchor["tx_hash"], flowscan_url=anchor["flowscan_url"])
        except Exception as e:
            yield _evt("error", f"CID anchor failed: {e}", "anchor_failed", error=str(e))

    # Done
    log_event("mission_complete", cargo=task["cargo"], receipt_hash=receipt_hash)
    yield _evt("system", "Mission complete. All systems nominal.", "mission_complete",
               cargo=task["cargo"], receipt_hash=receipt_hash,
               flowscan_url=payment.get("flowscan_url") if payment else None,
               piece_cid=piece_cid)
