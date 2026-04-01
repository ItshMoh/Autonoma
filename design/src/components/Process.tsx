import { motion } from 'motion/react';
import { MessageSquare, Search, Package, ArrowRightLeft, CheckCircle2, FileCheck } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    title: "01 Command Received",
    text: "Operator sends natural-language mission command."
  },
  {
    icon: Search,
    title: "02 Carrier Discovered",
    text: "DHT lookup finds available carrier robot."
  },
  {
    icon: Package,
    title: "03 Pickup + Transfer",
    text: "Carrier picks payload and enters transit corridor."
  },
  {
    icon: ArrowRightLeft,
    title: "04 Passage Negotiation",
    text: "Robots resolve crossing priority peer-to-peer."
  },
  {
    icon: CheckCircle2,
    title: "05 Delivery + Receipt",
    text: "Receiver signs handover proof."
  },
  {
    icon: FileCheck,
    title: "06 Payment + Audit",
    text: "Flow payment fires; trace uploaded to Filecoin."
  }
];

export default function Process() {
  return (
    <section id="process" className="min-h-screen flex items-center px-6 py-24 relative z-10">
      <div className="max-w-7xl mx-auto w-full flex justify-start">
        <div className="w-full md:w-[60%] lg:w-[50%]">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-[1px] w-12 bg-brand-orange/50" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-brand-orange">Workflow Snapshot</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              <span className="bg-gradient-to-r from-white/40 to-white text-gradient block">Mission</span>
              <span className="text-white block mt-2">/ Lifecycle</span>
            </h2>
          </motion.div>

          <div className="relative pl-8 pointer-events-auto">
            {/* Vertical Line */}
            <motion.div 
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-brand-orange via-white/20 to-transparent origin-top"
            />

            <div className="space-y-12">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
                  className="relative"
                >
                  {/* Icon Circle */}
                  <div className="absolute -left-[39px] top-1 w-8 h-8 rounded-full bg-black border border-brand-orange/50 flex items-center justify-center">
                    <step.icon className="w-3.5 h-3.5 text-brand-orange" />
                  </div>
                  
                  <h3 className="font-display text-lg md:text-xl text-white/90 mb-2">{step.title}</h3>
                  <p className="font-body text-sm text-white/60 leading-relaxed">
                    {step.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
