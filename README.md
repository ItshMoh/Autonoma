# AUTONOMA

**Decentralized Robotic Delivery Protocol — Four Robots, Zero Servers, One Protocol.**

A peer-to-peer coordination and settlement layer for autonomous mobile robots. Robots discover each other via libp2p, negotiate physical conflicts in real time, settle delivery payments on Flow, and write immutable mission audits to Filecoin — all without a central server.

See the Demo Here - https://www.youtube.com/watch?v=WXJL0_udqbY

Here is the Website Link - https://autonoma-flax.vercel.app/

---

## What It Does

An operator issues a natural language delivery command. AI parses it into a structured task. Robot A discovers a carrier (Robot B) through Kademlia DHT — no database, no API. B picks up the package, encounters Robot C at a narrow passage, and they negotiate priority over a direct libp2p stream. C yields autonomously. B delivers to Robot D, who signs a cryptographic receipt and broadcasts it via Gossipsub. Payment fires on Flow EVM testnet. The full decision trace is bundled, summarized by AI, and pinned to Filecoin with the PieceCID anchored back on-chain.

Zero human intervention after the initial command.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Simulation | ROS2 Jazzy + Gazebo Harmonic (2D arena, 4 robots) |
| P2P Networking | go-libp2p (Kademlia DHT + Gossipsub) |
| On-Chain Payment | Flow EVM Testnet (web3.py) |
| Audit Storage | Filecoin via Synapse SDK |
| Intelligence | OpenRouter API (task parsing + audit summary) |
| Frontend | React + TypeScript + Vite + Tailwind |
| Backend | FastAPI + SSE streaming |

## Demo Flow

1. Operator sends delivery command from the UI
2. AI parses command into structured task (sender, receiver, cargo, priority)
3. Robot A queries DHT, discovers Robot B as carrier
4. Robot B picks up package from A, heads to narrow passage
5. Robot B and C negotiate at bottleneck — higher priority wins, C yields
6. Robot B delivers to Robot D
7. Robot D signs receipt, broadcasts confirmation via Gossipsub
8. FLOW payment fires automatically — verifiable on Flowscan
9. Mission trace uploaded to Filecoin — PieceCID anchored on Flow

## Project Structure

```
automation/
  cli.py                    # CLI entry point
  design/                   # Frontend (React + Vite)
  backend/                  # FastAPI server + SSE mission streaming
  simulation/               # Gazebo arena + ROS2 launch
  p2p/                      # go-libp2p sidecar daemons
  robots/                   # Robot agents (A, B, C, D) + shared utilities
  blockchain/               # Flow EVM payment module
  audit/                    # Filecoin upload + AI audit summary
```

## Run Locally

```bash
# 1. Gazebo simulation
ros2 launch simulation/launch/arena_launch.py

# 2. P2P daemons (4 terminals)
cd p2p && go build -o swarm-daemon .
./swarm-daemon --robot robot_a --http-port 8001 --p2p-port 9001
# ... (B, C, D with bootstrap flag)

# 3. Backend
source venv/bin/activate
python -m uvicorn backend.server:app --port 8080

# 4. Frontend
cd design && npm install && npm run dev
```

## Built For

**PL Genesis 2026** — AI & Robotics Track

## License

MIT
