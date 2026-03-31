#!/usr/bin/env python3
"""Sovereign Swarm CLI — Command the robot swarm with natural language."""

import sys
import os
import json
import threading
import time
import subprocess

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from robots.shared.openrouter import parse_task
from robots.shared.logger import log_event, TRACE_FILE
from robots.robot_a import RobotA
from robots.robot_b import RobotB
from robots.robot_c import RobotC
from robots.robot_d import RobotD
from blockchain.flow_payment import send_payment, store_audit_cid
from audit.summarizer import summarize_mission


def run_mission(task: dict):
    """Execute the full delivery mission with all 4 robots."""

    # Clear previous trace
    if os.path.exists(TRACE_FILE):
        os.remove(TRACE_FILE)

    print("\n" + "=" * 60)
    print("  SOVEREIGN SWARM — MISSION START")
    print("=" * 60)
    print(f"  Cargo:    {task['cargo']}")
    print(f"  Priority: {task['priority']}")
    print(f"  Route:    {task['sender']} -> [DHT discovery] -> {task['receiver']}")
    print(f"  Desc:     {task['description']}")
    print("=" * 60 + "\n")

    log_event("mission_start", cargo=task["cargo"], priority=task["priority"],
              sender=task["sender"], receiver=task["receiver"],
              description=task["description"])

    # Initialize all robots (ports from .env)
    a = RobotA(p2p_port=int(os.getenv("ROBOT_A_P2P_PORT", 8001)))
    b = RobotB(p2p_port=int(os.getenv("ROBOT_B_P2P_PORT", 8002)))
    c = RobotC(p2p_port=int(os.getenv("ROBOT_C_P2P_PORT", 8004)))
    d = RobotD(p2p_port=int(os.getenv("ROBOT_D_P2P_PORT", 8005)))

    # Step 1: Robot B announces carrier capability
    b.announce_carrier()
    time.sleep(2)  # give DHT time to propagate

    # Step 2: Robot A discovers carrier via DHT and assigns task
    carrier_id = a.assign_task(task)

    # Step 3: Robot B receives task
    b.wait_for_task()

    # Step 4: Robot B goes to Robot A to pick up the package
    b.pickup_from_sender()

    # Step 5: Robot B heads toward passage, Robot C approaches from south simultaneously
    # Run C's approach + listener in a thread so both move at the same time
    c_result = [None]
    c_info = c.p2p.get_id()

    def c_approach_and_listen():
        c_result[0] = c.listen_for_negotiation(timeout=60)

    c_thread = threading.Thread(target=c_approach_and_listen)
    c_thread.start()

    # Robot B navigates to passage (C is also moving toward it simultaneously)
    b.navigate_to_passage()

    # Step 6: Narrow passage negotiation
    b.negotiate_passage(c_info["peer_id"])
    c_thread.join(timeout=30)

    print(f"[Robot C] Result: {c_result[0]}")

    # Step 7: Robot B delivers to Robot D
    d_info = d.p2p.get_id()

    # Run D's listener in a thread
    handover_data = [None]

    def d_listen():
        handover_data[0] = d.wait_for_handover(timeout=60)

    d_thread = threading.Thread(target=d_listen)
    d_thread.start()
    time.sleep(0.5)

    b.deliver_to_receiver(d_info["peer_id"])
    d_thread.join(timeout=30)

    # Step 8: Robot D signs receipt and broadcasts via Gossipsub
    receipt_hash = d.sign_and_broadcast(task["cargo"])

    # Step 9: Robot A receives confirmation
    time.sleep(2)  # give gossip time to propagate
    try:
        confirmation = a.wait_for_confirmation(timeout=15)
    except TimeoutError:
        print("[Robot A] Timeout waiting for gossip — checking manually...")
        confirmation = {"receipt_hash": receipt_hash}

    # Step 10: Trigger on-chain payment on Flow EVM testnet
    print("\n[Payment] Triggering FLOW payment on testnet...")
    try:
        payment = send_payment(receipt_hash)
        print(f"[Payment] Status: {payment['status']}")
        print(f"[Payment] Tx Hash: 0x{payment['tx_hash']}")
        print(f"[Payment] Amount: {payment['amount']} FLOW")
        print(f"[Payment] Block: {payment['block']}")
        print(f"[Payment] Verify: {payment['flowscan_url']}")
        log_event("payment_triggered",
                  tx_hash=payment["tx_hash"],
                  flowscan_url=payment["flowscan_url"],
                  amount=payment["amount"],
                  block=payment["block"])
    except Exception as e:
        print(f"[Payment] Failed: {e}")
        log_event("payment_failed", error=str(e))

    # ── Phase 5: Filecoin Audit Trail ────────────────────────────────────────

    root = os.path.dirname(os.path.abspath(__file__))
    bundle_path = os.path.join(root, "mission_bundle.json")
    piece_cid = None

    # Step 11: AI audit summary
    print("\n[Audit] Generating AI mission summary...")
    try:
        ai_summary = summarize_mission(TRACE_FILE)
        print(f"[Audit] Summary:\n{ai_summary}\n")
    except Exception as e:
        print(f"[Audit] Summary failed: {e}")
        ai_summary = "Summary unavailable."

    # Step 12: Build mission bundle
    bundle = {
        "mission_id": receipt_hash[:16],
        "cargo": task["cargo"],
        "priority": task["priority"],
        "trace": [],
        "ai_summary": ai_summary,
        "receipt_hash": receipt_hash,
        "flow_tx": payment.get("tx_hash") if "payment" in dir() and payment else None,
        "flowscan_url": payment.get("flowscan_url") if "payment" in dir() and payment else None,
    }
    try:
        with open(TRACE_FILE, "r") as f:
            bundle["trace"] = [json.loads(line) for line in f if line.strip()]
    except Exception:
        pass

    with open(bundle_path, "w") as f:
        json.dump(bundle, f, indent=2)
    print(f"[Audit] Bundle saved: {bundle_path}")

    # Step 13: Upload to Filecoin via Synapse SDK
    print("[Audit] Uploading to Filecoin (Calibration testnet)...")
    try:
        uploader = os.path.join(root, "audit", "uploader.js")
        result = subprocess.run(
            ["node", uploader, bundle_path],
            capture_output=True, text=True, timeout=120
        )
        # stderr has progress logs — print them for visibility
        if result.stderr:
            for line in result.stderr.strip().splitlines():
                print(line)
        if result.returncode == 0 and result.stdout.strip():
            piece_cid = result.stdout.strip()
            print(f"[Audit] PieceCID: {piece_cid}")
            log_event("filecoin_upload", piece_cid=piece_cid)
        else:
            print(f"[Audit] Upload failed (exit {result.returncode})")
            log_event("filecoin_upload_failed", stderr=result.stderr[:200])
    except subprocess.TimeoutExpired:
        print("[Audit] Upload timed out (120s)")
    except Exception as e:
        print(f"[Audit] Upload error: {e}")

    # Step 14: Anchor PieceCID on Flow chain
    if piece_cid:
        print("\n[Audit] Anchoring PieceCID on Flow EVM testnet...")
        try:
            anchor = store_audit_cid(piece_cid, receipt_hash)
            print(f"[Audit] Anchor tx: {anchor['flowscan_url']}")
            log_event("audit_cid_anchored",
                      piece_cid=piece_cid,
                      tx_hash=anchor["tx_hash"],
                      flowscan_url=anchor["flowscan_url"])
        except Exception as e:
            print(f"[Audit] Anchor failed: {e}")
            log_event("audit_cid_anchor_failed", error=str(e))

    # ─────────────────────────────────────────────────────────────────────────

    print("\n" + "=" * 60)
    print("  MISSION COMPLETE")
    print("=" * 60)
    print(f"  Cargo:        {task['cargo']}")
    print(f"  Receipt Hash: {receipt_hash[:32]}...")
    if 'payment' in dir() and payment:
        print(f"  Payment:      {payment['flowscan_url']}")
    if piece_cid:
        print(f"  Filecoin CID: {piece_cid}")
    if piece_cid and 'anchor' in dir() and anchor:
        print(f"  CID on Flow:  {anchor['flowscan_url']}")
    print(f"  Trace Log:    {TRACE_FILE}")
    print("=" * 60 + "\n")

    log_event("mission_complete", cargo=task["cargo"], receipt_hash=receipt_hash)
    return receipt_hash


def main():
    print("\n  Sovereign Swarm CLI")
    print("  Type a delivery command in natural language, or 'quit' to exit.\n")
    print("  Prerequisites: 4 P2P daemons running on ports from .env\n")

    while True:
        try:
            command = input("swarm> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            break

        if not command:
            continue
        if command.lower() in ("quit", "exit", "q"):
            print("Exiting.")
            break

        # Parse natural language to structured task
        print("[CLI] Parsing command with AI...")
        try:
            task = parse_task(command)
            print(f"[CLI] Parsed task: {json.dumps(task, indent=2)}")
        except Exception as e:
            print(f"[CLI] Failed to parse command: {e}")
            continue

        # Confirm with user
        confirm = input("[CLI] Execute this mission? (y/n): ").strip().lower()
        if confirm != "y":
            print("[CLI] Mission cancelled.")
            continue

        # Run the mission
        try:
            run_mission(task)
        except Exception as e:
            print(f"\n[CLI] Mission failed: {e}")


if __name__ == "__main__":
    main()
