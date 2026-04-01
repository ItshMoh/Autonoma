import { motion } from 'motion/react';
import { steps } from '../data/steps';
import { StepDiagram } from './DiagramRenderer';

export default function Architecture() {
  return (
    <div className="min-h-screen bg-black/80 backdrop-blur-md selection:bg-brand-orange/30 pointer-events-auto">
      {/* Header */}
      <header className="pt-24 pb-16 px-8 max-w-7xl mx-auto text-center">
        <div className="text-brand-orange font-mono text-sm uppercase tracking-widest mb-4">
          Protocol Architecture
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-6">
          Nine Steps to Autonomous Delivery
        </h1>
        <p className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed font-body">
          From a natural language command to trustless settlement — every step runs without a central server, using P2P discovery, on-chain payments, and decentralized storage.
        </p>
      </header>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32 space-y-24 md:space-y-32">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:flex-row items-start gap-8 md:gap-12"
          >
            {/* Left: Diagram for this step */}
            <div className="w-full md:w-1/2">
              <StepDiagram step={step.id} />
            </div>

            {/* Right: Content for this step */}
            <div className="w-full md:w-1/2">
              {/* Step number */}
              <div className="text-brand-orange font-display text-xl font-bold mb-2">
                {String(step.id).padStart(2, '0')}
              </div>

              <h2 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white mb-4">
                {step.title}
              </h2>

              <p className="font-body text-base text-white/70 leading-relaxed mb-8">
                {step.description}
              </p>

              {/* Flowchart */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 font-mono text-sm">
                {step.flowNodes.map((node, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    {node.type === 'box' && (
                      <div className="bg-white/10 text-white px-4 py-2 rounded border border-white/20 w-full max-w-[280px]">
                        {node.text}
                      </div>
                    )}
                    {node.type === 'arrow' && (
                      <div className="flex flex-col items-center my-2 text-white/40 text-xs">
                        <div className="h-6 w-px bg-white/20 mb-1"></div>
                        <span>{node.text}</span>
                        <div className="h-6 w-px bg-white/20 mt-1 relative">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border-r border-b border-white/20 rotate-45"></div>
                        </div>
                      </div>
                    )}
                    {node.type === 'split' && (
                      <div className="flex w-full max-w-[320px] justify-between gap-4">
                        <div className="bg-white/10 text-white px-3 py-2 rounded border border-white/20 flex-1">
                          {node.left}
                        </div>
                        <div className="bg-white/10 text-white px-3 py-2 rounded border border-white/20 flex-1">
                          {node.right}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
