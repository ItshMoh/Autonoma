import { motion } from 'motion/react';

export default function Demo() {
  return (
    <section id="demo" className="min-h-screen flex items-center px-6 py-24 relative z-10 bg-black/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-[1px] w-12 bg-brand-orange/50" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-brand-orange">Live Demo Recording</span>
            <div className="h-[1px] w-12 bg-brand-orange/50" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white/40 to-white text-gradient block">Mission</span>
            <span className="text-white block mt-2">/ In Action</span>
          </h2>
          <p className="text-white/60 font-body max-w-2xl mx-auto">
            Watch the full AUTONOMA mission loop: command intake, robot coordination, delivery confirmation, and on-chain settlement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-2 pointer-events-auto shadow-2xl"
        >
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/WXJL0_udqbY"
              title="AUTONOMA - Decentralised Robotics Delivery" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            ></iframe>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
