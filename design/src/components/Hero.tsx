import { motion } from 'motion/react';
import { PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="home" className="min-h-screen w-full relative overflow-hidden flex items-center">
      {/* Horizontal Text on the Left */}
      <div className="absolute left-6 md:left-16 lg:left-24 z-10 max-w-xl pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-[1px] w-12 bg-brand-orange/50" />
            <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-brand-orange">
              Sovereign Swarm Protocol
            </span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extralight uppercase tracking-tight leading-tight">
            <span className="text-white block">Decentralized</span>
            <span className="text-white/70 block">Robotic</span>
            <span className="text-white/40 block">Delivery</span>
          </h1>
        </motion.div>
      </div>

      {/* Centered Watch Demo Button */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Link to="/demo" className="group flex items-center space-x-3 bg-white/5 border border-white/10 text-white font-mono text-xs uppercase px-8 py-4 rounded-full hover:bg-white/10 transition-colors backdrop-blur-md">
            <PlayCircle className="w-4 h-4 text-brand-orange" />
            <span>Watch Demo</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
