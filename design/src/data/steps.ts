export const steps = [
  {
    id: 1,
    title: "Operator Command",
    description: "The operator types a natural language delivery command into the web UI. The FastAPI backend forwards it to OpenRouter AI, which parses it into a structured task object — extracting sender, receiver, cargo type, and priority level. No rigid forms, no dropdowns. Just plain language in, structured mission out.",
    flowNodes: [
      { type: 'box', text: 'Operator (Web UI)' },
      { type: 'arrow', text: 'natural language' },
      { type: 'box', text: 'FastAPI Backend' },
      { type: 'arrow', text: 'forward to AI' },
      { type: 'box', text: 'OpenRouter API' },
      { type: 'arrow', text: 'structured task JSON' },
      { type: 'box', text: 'Mission Object Created' }
    ]
  },
  {
    id: 2,
    title: "DHT Discovery",
    description: "Robot A needs a carrier. Instead of querying a central database, it performs a Kademlia DHT lookup through the go-libp2p network. Each robot runs a sidecar P2P daemon. A broadcasts a capability query — \"who can carry?\" — and the DHT routes it across the mesh. Robot B responds with its availability and carrier capability. A direct peer-to-peer link is established. No server was involved.",
    flowNodes: [
      { type: 'box', text: 'Robot A' },
      { type: 'arrow', text: 'DHT capability query' },
      { type: 'box', text: 'Kademlia DHT (go-libp2p)' },
      { type: 'arrow', text: 'route across peers' },
      { type: 'box', text: 'Robot B responds: "carrier available"' },
      { type: 'arrow', text: 'direct P2P stream' },
      { type: 'box', text: 'A <--> B Link Established' }
    ]
  },
  {
    id: 3,
    title: "Physical Handover & On-Chain Commitment",
    description: "Robot A transfers the physical parcel to Robot B at the pickup zone. The moment the handover completes, an on-chain commitment is created on Flow EVM. This transaction records: who handed off (A), who received custody (B), the cargo description, and the intended final recipient (D). Robot B is now the registered custodian. The physical and digital states are in sync.",
    flowNodes: [
      { type: 'box', text: 'Robot A: has parcel' },
      { type: 'arrow', text: 'physical handover' },
      { type: 'box', text: 'Robot B: receives parcel' },
      { type: 'arrow', text: 'simultaneous' },
      { type: 'box', text: 'Flow EVM Testnet' },
      { type: 'arrow', text: 'commitment transaction' },
      { type: 'box', text: 'Custody Record: B holds parcel for D' }
    ]
  },
  {
    id: 4,
    title: "Transit to Narrow Passage",
    description: "Robot B begins navigating the Gazebo arena toward the delivery destination. The 2D simulation runs on ROS2 Jazzy with Gazebo Harmonic. During transit, Robot B approaches a narrow corridor — a physical bottleneck where only one robot can pass at a time. Robot C, an independent worker on a separate task, is heading toward the same passage from the opposite direction. A conflict is imminent.",
    flowNodes: [
      { type: 'box', text: 'Robot B (carrying parcel)' },
      { type: 'arrow', text: 'navigating arena' },
      { type: 'box', text: 'Narrow Passage Ahead' },
      { type: 'arrow', text: 'simultaneously' },
      { type: 'box', text: 'Robot C (independent worker)' },
      { type: 'arrow', text: 'approaching same passage' },
      { type: 'box', text: 'Collision Detected' }
    ]
  },
  {
    id: 5,
    title: "P2P Negotiation",
    description: "When both robots arrive at the bottleneck, they open a direct libp2p stream and exchange metadata — cargo status, priority level, and current task. The conflict resolution is pure code logic: the robot with higher cargo priority wins passage. Robot B carries a high-priority parcel (priority > 0). Robot C is empty (priority = 0). C autonomously pulls into the yield zone. B passes through. No server arbitrated. No human intervened. The decision was peer-to-peer and instant.",
    flowNodes: [
      { type: 'split', left: 'Robot B: priority HIGH', right: 'Robot C: priority NONE' },
      { type: 'arrow', text: 'libp2p stream' },
      { type: 'arrow', text: 'metadata exchange' },
      { type: 'box', text: 'Priority Comparison' },
      { type: 'arrow', text: 'B > C (cargo wins)' },
      { type: 'box', text: 'C yields --> Yield Zone' },
      { type: 'box', text: 'B passes through corridor' }
    ]
  },
  {
    id: 6,
    title: "Final Delivery",
    description: "Robot B clears the passage and navigates to the delivery zone where Robot D is waiting. The physical parcel is handed over from B to D. The delivery leg is complete — the package has traveled from A to B to D through a fully decentralized relay, passing through a contested bottleneck that was resolved autonomously.",
    flowNodes: [
      { type: 'box', text: 'Robot B (with parcel)' },
      { type: 'arrow', text: 'navigate to destination' },
      { type: 'box', text: 'Delivery Zone' },
      { type: 'arrow', text: 'physical handover' },
      { type: 'box', text: 'Robot D: receives parcel' },
      { type: 'box', text: 'Delivery Complete' }
    ]
  },
  {
    id: 7,
    title: "Gossipsub Broadcast",
    description: "Robot D signs a cryptographic proof-of-receipt and broadcasts it across the swarm using Gossipsub — libp2p's pub/sub protocol. Every peer in the network receives the confirmation. The entire swarm now has consensus that the delivery succeeded. This acts as a decentralized receipt — no single node needs to be trusted, because every node witnessed the confirmation.",
    flowNodes: [
      { type: 'box', text: 'Robot D' },
      { type: 'arrow', text: 'sign receipt (crypto)' },
      { type: 'box', text: 'Gossipsub Broadcast' },
      { type: 'arrow', text: 'propagate to all peers' },
      { type: 'split', left: 'Robot A: confirmed', right: 'Robot B: confirmed' },
      { type: 'box', text: 'Robot C: confirmed' },
      { type: 'box', text: 'Swarm Consensus: Delivery Verified' }
    ]
  },
  {
    id: 8,
    title: "Automated Payment",
    description: "Once the Gossipsub receipt is verified, Robot A's smart contract on Flow EVM automatically triggers payment. FLOW tokens transfer from A's vault to B's vault — B is the carrier who did the work. The transaction is verifiable on Flowscan. No invoice, no manual approval, no payment gateway. The protocol settles itself. Code is the accountant.",
    flowNodes: [
      { type: 'box', text: 'Gossipsub Receipt Verified' },
      { type: 'arrow', text: 'trigger smart contract' },
      { type: 'box', text: 'Flow EVM Smart Contract' },
      { type: 'arrow', text: 'transfer FLOW tokens' },
      { type: 'split', left: "A's Vault", right: "B's Vault" },
      { type: 'box', text: 'Payment Settled — Viewable on Flowscan' }
    ]
  },
  {
    id: 9,
    title: "Filecoin Archival",
    description: "The entire mission's decision trace — every DHT lookup, every negotiation message, every Gossipsub broadcast — has been logged to `mission_trace.jsonl`. OpenRouter AI generates a human-readable audit summary. The raw trace and the AI summary are bundled together and uploaded to Filecoin via the Synapse SDK. The returned PieceCID is anchored back on the Flow blockchain. The mission now has a permanent, tamper-proof audit trail. Anyone can verify what happened, when, and why — forever.",
    flowNodes: [
      { type: 'box', text: 'mission_trace.jsonl' },
      { type: 'arrow', text: 'AI summarization (OpenRouter)' },
      { type: 'box', text: 'Audit Summary Report' },
      { type: 'arrow', text: 'bundle trace + summary' },
      { type: 'box', text: 'Synapse SDK Upload' },
      { type: 'arrow', text: 'stored on Filecoin' },
      { type: 'box', text: 'PieceCID: bafkzcib...' },
      { type: 'arrow', text: 'anchor CID on-chain' },
      { type: 'box', text: 'Flow EVM: CID Recorded' },
      { type: 'box', text: 'Immutable Audit Trail Complete' }
    ]
  }
];
