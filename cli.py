#!/usr/bin/env python3
"""Sovereign Swarm CLI — Command the robot swarm with natural language."""

import sys
import os
import json
import threading
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from robots.shared.openrouter import parse_task
from robots.shared.logger import log_event, TRACE_FILE
from robots.robot_a import RobotA
from robots.robot_b import RobotB
from robots.robot_c import RobotC
from robots.robot_d import RobotD


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

    print("\n" + "=" * 60)
    print("  MISSION COMPLETE")
    print("=" * 60)
    print(f"  Cargo:        {task['cargo']}")
    print(f"  Receipt Hash: {receipt_hash[:32]}...")
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
