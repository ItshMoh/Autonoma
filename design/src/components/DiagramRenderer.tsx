import React, { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const RobotNode = ({ x, y, color, label, delay = 0 }: any) => (
  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay, type: 'spring' }}>
    <rect x={x-25} y={y-25} width="50" height="50" fill="none" stroke={color} strokeWidth="3" />
    <circle cx={x} cy={y-5} r="8" fill={color} />
    <rect x={x-15} y={y+10} width="30" height="5" fill={color} opacity="0.5" />
    <text x={x} y={y+45} textAnchor="middle" fontSize="14" fill={color} fontWeight="bold">Robot {label}</text>
  </motion.g>
);

const Step1 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    {/* Laptop */}
    <motion.g initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <rect x="250" y="80" width="100" height="60" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M230 140 L370 140 L380 150 L220 150 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="300" y="115" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.6">Operator</text>
    </motion.g>

    {/* Speech Bubble */}
    <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}>
      <path d="M360 60 Q 480 60 480 100 Q 480 140 360 140 L 340 160 L 350 135 Q 240 130 240 100 Q 240 60 360 60" fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="4 4" />
      <text x="360" y="95" textAnchor="middle" fontSize="10" fill="#F97316">"Send high-priority parcel</text>
      <text x="360" y="110" textAnchor="middle" fontSize="10" fill="#F97316">from A to D"</text>
    </motion.g>

    {/* Arrow */}
    <motion.path
      d="M300 160 L300 220"
      fill="none" stroke="currentColor" strokeWidth="2"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.5 }}
    />
    <motion.polygon points="295,215 305,215 300,225" fill="currentColor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} />

    {/* AI Brain */}
    <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }}>
      <circle cx="300" cy="260" r="30" fill="none" stroke="#A855F7" strokeWidth="2" />
      <path d="M285 260 Q300 240 315 260 Q300 280 285 260" fill="none" stroke="#A855F7" strokeWidth="2" />
      <text x="300" y="310" textAnchor="middle" fontSize="12" fill="#A855F7">OpenRouter AI</text>
    </motion.g>

    {/* Arrow Down */}
    <motion.path
      d="M300 320 L300 360"
      fill="none" stroke="currentColor" strokeWidth="2"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2, duration: 0.5 }}
    />
    <motion.polygon points="295,355 305,355 300,365" fill="currentColor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} />

    {/* JSON */}
    <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.5 }}>
      <rect x="200" y="370" width="200" height="80" fill="#111" stroke="#333" strokeWidth="2" />
      <text x="220" y="395" fontSize="10" fill="#4ADE80">{`{`}</text>
      <text x="230" y="410" fontSize="10" fill="#9CA3AF">sender: <tspan fill="#F97316">"A"</tspan>,</text>
      <text x="230" y="425" fontSize="10" fill="#9CA3AF">receiver: <tspan fill="#10B981">"D"</tspan>,</text>
      <text x="230" y="440" fontSize="10" fill="#9CA3AF">cargo: <tspan fill="#F87171">"high-priority"</tspan></text>
      <text x="220" y="455" fontSize="10" fill="#4ADE80">{`}`}</text>
    </motion.g>
  </svg>
);

const Step2 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    {/* Pings from A */}
    <motion.circle cx="150" cy="250" r="50" fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="4 4"
      initial={{ r: 0, opacity: 1 }} animate={{ r: 200, opacity: 0 }} transition={{ delay: 1, duration: 2, repeat: Infinity }} />
    <motion.circle cx="150" cy="250" r="50" fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="4 4"
      initial={{ r: 0, opacity: 1 }} animate={{ r: 200, opacity: 0 }} transition={{ delay: 1.5, duration: 2, repeat: Infinity }} />

    {/* Connections */}
    <motion.path d="M175 250 L375 125" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5 5"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2, duration: 0.5 }} />
    <motion.path d="M175 250 L375 375" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5 5"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1, opacity: 0 }} transition={{ delay: 2, duration: 1.5 }} />
    <motion.path d="M175 250 L475 250" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5 5"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1, opacity: 0 }} transition={{ delay: 2, duration: 1.5 }} />

    {/* Solid Connection A -> B */}
    <motion.path d="M175 250 L375 125" fill="none" stroke="#3B82F6" strokeWidth="3"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 3, duration: 0.5 }} />
    <motion.text x="275" y="170" textAnchor="middle" fontSize="12" fill="#3B82F6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }} transform="rotate(-26 275 170)">
      carrier available
    </motion.text>

    {/* Robots */}
    <RobotNode x={150} y={250} color="#F97316" label="A" delay={0.2} />
    <RobotNode x={400} y={125} color="#3B82F6" label="B" delay={0.4} />
    <RobotNode x={400} y={375} color="#9CA3AF" label="C" delay={0.6} />
    <RobotNode x={500} y={250} color="#10B981" label="D" delay={0.8} />

    {/* Badge on B */}
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.5, type: 'spring' }}>
      <rect x="420" y="80" width="60" height="20" fill="#3B82F6" />
      <text x="450" y="93" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">CARRIER</text>
    </motion.g>
  </svg>
);

const Step3 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    <RobotNode x={200} y={200} color="#F97316" label="A" delay={0} />
    <RobotNode x={400} y={200} color="#3B82F6" label="B" delay={0} />

    {/* Parcel sliding */}
    <motion.g
      initial={{ x: 230, y: 190 }}
      animate={{ x: 350, y: 190 }}
      transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
    >
      <rect x="0" y="0" width="20" height="20" fill="#F59E0B" />
      <path d="M0 10 L20 10 M10 0 L10 20" stroke="#B45309" strokeWidth="1" />
    </motion.g>

    {/* Arrow down to chain */}
    <motion.path d="M300 230 L300 350" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 4"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.5, duration: 0.5 }} />

    {/* Document */}
    <motion.g initial={{ y: 230, opacity: 0 }} animate={{ y: 300, opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}>
      <rect x="280" y="0" width="40" height="50" fill="#222" stroke="#fff" strokeWidth="2" />
      <line x1="285" y1="10" x2="315" y2="10" stroke="#fff" strokeWidth="2" />
      <line x1="285" y1="20" x2="315" y2="20" stroke="#fff" strokeWidth="2" />
      <line x1="285" y1="30" x2="305" y2="30" stroke="#fff" strokeWidth="2" />
      <text x="330" y="25" fontSize="12" fill="#fff">Commitment TX</text>
    </motion.g>

    {/* Blockchain */}
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.5, type: 'spring' }}>
      <rect x="200" y="360" width="200" height="60" fill="#111" stroke="#10B981" strokeWidth="2" />
      <circle cx="240" cy="390" r="15" fill="none" stroke="#10B981" strokeWidth="2" />
      <circle cx="300" cy="390" r="15" fill="none" stroke="#10B981" strokeWidth="2" />
      <circle cx="360" cy="390" r="15" fill="none" stroke="#10B981" strokeWidth="2" />
      <line x1="255" y1="390" x2="285" y2="390" stroke="#10B981" strokeWidth="2" />
      <line x1="315" y1="390" x2="345" y2="390" stroke="#10B981" strokeWidth="2" />
      <text x="300" y="440" textAnchor="middle" fontSize="14" fill="#10B981" fontWeight="bold">Flow EVM</text>
      {/* Checkmark */}
      <path d="M290 390 L298 398 L312 382" fill="none" stroke="#10B981" strokeWidth="3" />
    </motion.g>
  </svg>
);

const Step4 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    {/* Map/Arena */}
    <rect x="50" y="50" width="500" height="400" fill="none" stroke="#333" strokeWidth="2" />
    <path d="M50 150 L250 150 L250 350 L50 350" fill="none" stroke="#333" strokeWidth="2" />
    <path d="M550 150 L350 150 L350 350 L550 350" fill="none" stroke="#333" strokeWidth="2" />

    {/* Narrow passage is between x=250 and x=350, y=150 to 350 */}
    <text x="300" y="140" textAnchor="middle" fontSize="12" fill="#666">Narrow Passage</text>

    {/* Path B */}
    <motion.path d="M150 250 L270 250" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5 5"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 2 }} />

    {/* Path C */}
    <motion.path d="M450 250 L330 250" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5 5"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 2 }} />

    {/* Robot B */}
    <motion.g initial={{ x: 150, y: 250 }} animate={{ x: 270, y: 250 }} transition={{ delay: 1, duration: 2, ease: "linear" }}>
      <rect x="-20" y="-20" width="40" height="40" fill="#111" stroke="#3B82F6" strokeWidth="2" />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#3B82F6" fontWeight="bold">B</text>
      {/* Parcel */}
      <rect x="-10" y="-30" width="20" height="20" fill="#F59E0B" />
    </motion.g>

    {/* Robot C */}
    <motion.g initial={{ x: 450, y: 250 }} animate={{ x: 330, y: 250 }} transition={{ delay: 1, duration: 2, ease: "linear" }}>
      <rect x="-20" y="-20" width="40" height="40" fill="#111" stroke="#9CA3AF" strokeWidth="2" />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#9CA3AF" fontWeight="bold">C</text>
    </motion.g>

    {/* Warning Icon */}
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3, type: 'spring' }}>
      <polygon points="300,210 320,245 280,245" fill="none" stroke="#EF4444" strokeWidth="2" />
      <line x1="300" y1="220" x2="300" y2="235" stroke="#EF4444" strokeWidth="2" />
      <circle cx="300" cy="240" r="1" fill="#EF4444" />
    </motion.g>
  </svg>
);

const Step5 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    {/* Passage lines */}
    <line x1="250" y1="100" x2="250" y2="400" stroke="#333" strokeWidth="4" />
    <line x1="350" y1="100" x2="350" y2="400" stroke="#333" strokeWidth="4" />

    {/* Yield Zone */}
    <rect x="350" y="300" width="80" height="80" fill="none" stroke="#666" strokeWidth="2" strokeDasharray="4 4" />
    <text x="390" y="395" textAnchor="middle" fontSize="10" fill="#666">Yield Zone</text>

    {/* Stream */}
    <motion.path d="M250 250 L350 250" fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 4"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.3 }} />
    <motion.text x="300" y="240" textAnchor="middle" fontSize="10" fill="#A855F7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      libp2p stream
    </motion.text>

    {/* Bubbles */}
    <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
      <rect x="100" y="160" width="120" height="40" fill="#111" stroke="#3B82F6" strokeWidth="1" />
      <text x="160" y="175" textAnchor="middle" fontSize="10" fill="#3B82F6">priority: HIGH</text>
      <text x="160" y="190" textAnchor="middle" fontSize="10" fill="#3B82F6">cargo: parcel</text>
    </motion.g>

    <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
      <rect x="380" y="160" width="120" height="40" fill="#111" stroke="#9CA3AF" strokeWidth="1" />
      <text x="440" y="175" textAnchor="middle" fontSize="10" fill="#9CA3AF">priority: NONE</text>
      <text x="440" y="190" textAnchor="middle" fontSize="10" fill="#9CA3AF">cargo: empty</text>
    </motion.g>

    {/* Scale */}
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: 'spring' }}>
      <path d="M280 200 L320 200 L300 180 Z" fill="none" stroke="#F59E0B" strokeWidth="2" />
      <text x="300" y="170" textAnchor="middle" fontSize="14" fill="#F59E0B" fontWeight="bold">B &gt; C</text>
    </motion.g>

    {/* Robot C Yielding */}
    <motion.g initial={{ x: 380, y: 250 }} animate={{ x: 390, y: 340 }} transition={{ delay: 1.6, duration: 0.8, ease: "easeInOut" }}>
      <rect x="-20" y="-20" width="40" height="40" fill="#111" stroke="#9CA3AF" strokeWidth="2" />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#9CA3AF" fontWeight="bold">C</text>
    </motion.g>

    {/* Robot B Passing */}
    <motion.g initial={{ x: 220, y: 250 }} animate={{ x: 380, y: 250 }} transition={{ delay: 2.0, duration: 1.0, ease: "easeInOut" }}>
      <rect x="-20" y="-20" width="40" height="40" fill="#111" stroke="#3B82F6" strokeWidth="2" />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#3B82F6" fontWeight="bold">B</text>
      <rect x="-10" y="-30" width="20" height="20" fill="#F59E0B" />
    </motion.g>
  </svg>
);

const Step6 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    {/* Delivery Zone */}
    <rect x="350" y="150" width="150" height="150" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5 5" />
    <text x="425" y="140" textAnchor="middle" fontSize="12" fill="#10B981">Delivery Zone</text>

    {/* Robot B moving in */}
    <motion.g initial={{ x: 100, y: 225 }} animate={{ x: 300, y: 225 }} transition={{ delay: 0.2, duration: 1.0, ease: "easeInOut" }}>
      <rect x="-20" y="-20" width="40" height="40" fill="#111" stroke="#3B82F6" strokeWidth="2" />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#3B82F6" fontWeight="bold">B</text>
    </motion.g>

    {/* Robot D */}
    <RobotNode x={425} y={225} color="#10B981" label="D" delay={0} />

    {/* Parcel sliding */}
    <motion.g
      initial={{ x: 300, y: 195 }}
      animate={{ x: 425, y: 195 }}
      transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
    >
      <rect x="-10" y="-10" width="20" height="20" fill="#F59E0B" />
      <path d="M-10 0 L10 0 M0 -10 L0 10" stroke="#B45309" strokeWidth="1" />
    </motion.g>

    {/* Checkmark on D */}
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.0, type: 'spring' }}>
      <circle cx="455" cy="195" r="12" fill="#10B981" />
      <path d="M449 195 L453 199 L461 191" fill="none" stroke="#fff" strokeWidth="2" />
    </motion.g>
  </svg>
);

const Step7 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    <RobotNode x={100} y={100} color="#F97316" label="A" delay={0} />
    <RobotNode x={100} y={400} color="#3B82F6" label="B" delay={0} />
    <RobotNode x={500} y={100} color="#9CA3AF" label="C" delay={0} />
    <RobotNode x={500} y={400} color="#10B981" label="D" delay={0} />

    {/* Receipt from D */}
    <motion.g initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring' }}>
      <rect x="480" y="310" width="40" height="50" fill="#222" stroke="#A855F7" strokeWidth="2" />
      <path d="M495 330 A 5 5 0 1 1 505 330 L 505 345 L 500 345 L 500 340 L 495 340 Z" fill="#A855F7" />
      <text x="500" y="300" textAnchor="middle" fontSize="10" fill="#A855F7">Signed Receipt</text>
    </motion.g>

    {/* Broadcast Waves */}
    <motion.circle cx="500" cy="400" r="50" fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="10 10"
      initial={{ r: 0, opacity: 1 }} animate={{ r: 600, opacity: 0 }} transition={{ delay: 0.6, duration: 1.5 }} />
    <motion.circle cx="500" cy="400" r="50" fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="10 10"
      initial={{ r: 0, opacity: 1 }} animate={{ r: 600, opacity: 0 }} transition={{ delay: 1.0, duration: 1.5 }} />

    <motion.text x="300" y="250" textAnchor="middle" fontSize="16" fill="#A855F7" fontWeight="bold"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
      Gossipsub Broadcast
    </motion.text>

    {/* Checkmarks */}
    {[
      {x: 130, y: 70, delay: 2.1},
      {x: 130, y: 370, delay: 1.8},
      {x: 530, y: 70, delay: 1.5},
      {x: 530, y: 370, delay: 0.8}
    ].map((pos, i) => (
      <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: pos.delay, type: 'spring' }}>
        <circle cx={pos.x} cy={pos.y} r="12" fill="#10B981" />
        <path d={`M${pos.x-6} ${pos.y} L${pos.x-2} ${pos.y+4} L${pos.x+6} ${pos.y-4}`} fill="none" stroke="#fff" strokeWidth="2" />
      </motion.g>
    ))}
  </svg>
);

const Step8 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    {/* Flow Blockchain */}
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
      <rect x="200" y="200" width="200" height="100" fill="#111" stroke="#10B981" strokeWidth="3" />
      <text x="300" y="240" textAnchor="middle" fontSize="16" fill="#10B981" fontWeight="bold">Flow EVM</text>
      <rect x="240" y="250" width="120" height="30" fill="#222" stroke="#10B981" strokeWidth="1" />
      <text x="300" y="270" textAnchor="middle" fontSize="12" fill="#10B981">Smart Contract</text>
    </motion.g>

    {/* Wallets */}
    <motion.g initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <rect x="50" y="220" width="80" height="60" fill="#111" stroke="#F97316" strokeWidth="2" />
      <text x="90" y="255" textAnchor="middle" fontSize="14" fill="#F97316">A's Vault</text>
    </motion.g>

    <motion.g initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <rect x="470" y="220" width="80" height="60" fill="#111" stroke="#3B82F6" strokeWidth="2" />
      <text x="510" y="255" textAnchor="middle" fontSize="14" fill="#3B82F6">B's Vault</text>
    </motion.g>

    {/* Receipt Trigger */}
    <motion.g initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
      <rect x="250" y="50" width="100" height="40" fill="#A855F7" opacity="0.2" />
      <text x="300" y="75" textAnchor="middle" fontSize="12" fill="#A855F7">Verified Receipt</text>
      <path d="M300 90 L300 190" fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 4" />
      <polygon points="295,185 305,185 300,195" fill="#A855F7" />
    </motion.g>

    {/* Token Transfer A -> Contract */}
    <motion.circle cx="130" cy="250" r="10" fill="#FBBF24"
      initial={{ x: 0, opacity: 0 }}
      animate={{ x: 110, opacity: [0, 1, 0] }}
      transition={{ delay: 1.0, duration: 0.6 }} />

    {/* Contract Checkmark */}
    <motion.path d="M290 265 L298 273 L312 257" fill="none" stroke="#10B981" strokeWidth="3"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6, duration: 0.3 }} />

    {/* Token Transfer Contract -> B */}
    <motion.circle cx="360" cy="250" r="10" fill="#FBBF24"
      initial={{ x: 0, opacity: 0 }}
      animate={{ x: 110, opacity: [0, 1, 0] }}
      transition={{ delay: 1.9, duration: 0.6 }} />

    {/* Flowscan */}
    <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.5 }}>
      <rect x="200" y="350" width="200" height="40" fill="#111" stroke="#333" strokeWidth="2" />
      <text x="300" y="375" textAnchor="middle" fontSize="10" fill="#9CA3AF">Flowscan: <tspan fill="#10B981">0x8f...3a2b</tspan></text>
    </motion.g>
  </svg>
);

const Step9 = () => (
  <svg viewBox="0 0 600 500" className="w-full h-full text-white font-mono">
    {/* Trace File */}
    <motion.g initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
      <rect x="100" y="100" width="60" height="80" fill="#111" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="110" y1="120" x2="150" y2="120" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="110" y1="140" x2="140" y2="140" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="110" y1="160" x2="150" y2="160" stroke="#9CA3AF" strokeWidth="2" />
      <text x="130" y="200" textAnchor="middle" fontSize="10" fill="#9CA3AF">mission_trace.jsonl</text>
    </motion.g>

    {/* AI */}
    <motion.path d="M160 140 L240 140" fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 4"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.3 }} />

    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}>
      <circle cx="280" cy="140" r="30" fill="none" stroke="#A855F7" strokeWidth="2" />
      <text x="280" y="145" textAnchor="middle" fontSize="14" fill="#A855F7">AI</text>
    </motion.g>

    {/* Summary */}
    <motion.path d="M310 140 L390 140" fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 4"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.3 }} />

    <motion.g initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2 }}>
      <rect x="390" y="100" width="60" height="80" fill="#111" stroke="#3B82F6" strokeWidth="2" />
      <line x1="400" y1="120" x2="440" y2="120" stroke="#3B82F6" strokeWidth="2" />
      <line x1="400" y1="140" x2="430" y2="140" stroke="#3B82F6" strokeWidth="2" />
      <text x="420" y="200" textAnchor="middle" fontSize="10" fill="#3B82F6">Audit Summary</text>
    </motion.g>

    {/* Bundle */}
    <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }}>
      <rect x="230" y="230" width="100" height="60" fill="#111" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />
      <text x="280" y="265" textAnchor="middle" fontSize="12" fill="#F59E0B">Bundle</text>
    </motion.g>

    {/* Arrows to Bundle */}
    <motion.path d="M130 210 L230 260" fill="none" stroke="#9CA3AF" strokeWidth="2"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.3 }} />
    <motion.path d="M420 210 L330 260" fill="none" stroke="#3B82F6" strokeWidth="2"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.3 }} />

    {/* Filecoin */}
    <motion.path d="M280 290 L280 340" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.1, duration: 0.3 }} />

    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.4, type: 'spring' }}>
      <path d="M240 370 Q280 330 320 370 Q280 410 240 370" fill="none" stroke="#38BDF8" strokeWidth="3" />
      <text x="280" y="375" textAnchor="middle" fontSize="14" fill="#38BDF8" fontWeight="bold">Filecoin</text>
      <text x="280" y="400" textAnchor="middle" fontSize="10" fill="#9CA3AF">bafkzcib...</text>
    </motion.g>

    {/* Anchor to Flow */}
    <motion.path d="M340 370 L420 370" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4"
      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.7, duration: 0.3 }} />
    <motion.polygon points="415,365 425,370 415,375" fill="#10B981" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.0 }} />

    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.0, type: 'spring' }}>
      <rect x="430" y="350" width="100" height="40" fill="#111" stroke="#10B981" strokeWidth="2" />
      <text x="480" y="375" textAnchor="middle" fontSize="12" fill="#10B981">Flow EVM</text>
    </motion.g>

    {/* Immutable Lock */}
    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 3.2, type: 'spring' }}>
      <rect x="470" y="410" width="20" height="20" fill="#F59E0B" />
      <path d="M475 410 L475 400 A 5 5 0 0 1 485 400 L485 410" fill="none" stroke="#F59E0B" strokeWidth="2" />
      <text x="480" y="445" textAnchor="middle" fontSize="10" fill="#F59E0B">Immutable</text>
    </motion.g>
  </svg>
);

const stepComponents: Record<number, React.FC> = {
  1: Step1, 2: Step2, 3: Step3, 4: Step4, 5: Step5,
  6: Step6, 7: Step7, 8: Step8, 9: Step9,
};

export function StepDiagram({ step }: { step: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component = stepComponents[step];
  if (!Component) return null;

  return (
    <div ref={ref} className="w-full aspect-square flex items-center justify-center bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {inView && <Component />}
    </div>
  );
}
