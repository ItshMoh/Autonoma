import { motion } from 'motion/react';
import { Database } from 'lucide-react';

export default function Architecture() {
  return (
    <section id="architechture" className="min-h-screen flex items-center px-6 py-24 relative z-10 bg-black/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto w-full text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-[1px] w-12 bg-brand-orange/50" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-brand-orange">System Design</span>
            <div className="h-[1px] w-12 bg-brand-orange/50" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-8">
            <span className="bg-gradient-to-r from-white/40 to-white text-gradient block">Architechture</span>
          </h2>
          
          <div className="p-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm pointer-events-auto flex flex-col items-center justify-center">
            <Database className="w-12 h-12 text-white/30 mb-6" />
            <p className="font-body text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
              Architecture section is reserved. Detailed system diagrams and data-flow mapping will be added in a later update.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
