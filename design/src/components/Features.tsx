import { motion } from 'motion/react';
import { Network, GitMerge, Coins, ShieldCheck } from 'lucide-react';

const cards = [
  { icon: Network, title: "P2P Discovery", stat: "Kademlia DHT", text: "Robot A discovers Robot B without any central server." },
  { icon: GitMerge, title: "Autonomous Negotiation", stat: "Narrow Passage Logic", text: "Robots exchange priority over libp2p stream. Lower priority yields." },
  { icon: Coins, title: "Flow Settlement", stat: "Flow EVM Testnet", text: "Delivery confirmation triggers automated payment with verifiable tx link." },
  { icon: ShieldCheck, title: "Filecoin Audit", stat: "PieceCID Archive", text: "Mission trace and AI summary are bundled and pinned for immutable proof." },
];

export default function Features() {
  return (
    <section id="features" className="min-h-screen flex items-center px-6 py-24">
      <div className="max-w-7xl mx-auto w-full flex justify-start">
        <div className="w-full md:w-[60%] lg:w-[55%]">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-[1px] w-12 bg-brand-orange/50" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-brand-orange">Core Systems</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              <span className="bg-gradient-to-r from-white/40 to-white text-gradient block">Decentralized</span>
              <span className="text-white block mt-2">/ Intelligence</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pointer-events-auto">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors flex flex-col h-full"
              >
                <card.icon className="w-6 h-6 text-brand-orange mb-8" />
                <div className="font-mono text-[10px] uppercase tracking-wider text-brand-orange/80 mb-2">{card.stat}</div>
                <div className="font-display text-lg font-medium text-white/90 mb-3">{card.title}</div>
                <div className="font-body text-sm text-white/60 leading-relaxed mt-auto">{card.text}</div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
