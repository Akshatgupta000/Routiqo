import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-24 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto bg-dark rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -ml-32 -mb-32" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-primary mb-8 border border-white/10">
            <Sparkles size={16} />
            <span className="text-sm font-bold tracking-wider uppercase">Ready to scale?</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Take Control of Your <br className="hidden md:block" /> Fleet Operations
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Join 500+ companies optimizing their logistics with RouteOps. Start your 14-day free trial today. No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary px-10 py-4 text-lg w-full sm:w-auto">
              Start Free Trial
            </button>
            <button className="px-10 py-4 text-white font-bold hover:text-primary transition-colors flex items-center gap-2 group w-full sm:w-auto justify-center">
              Schedule a Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
