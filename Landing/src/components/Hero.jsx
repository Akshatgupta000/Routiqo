import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Truck, Zap } from 'lucide-react';

const Hero = ({ openAuth }) => {
  return (
    <section id="home" className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-dark font-semibold text-xs mb-4 border border-primary/20">
              New: AI-Powered Dispatching v4.0
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark leading-[1.1] mb-5">
              Optimize Your Fleet. <br />
              <span className="text-primary bg-dark px-3 py-1 rounded-xl inline-block mt-2">Deliver Smarter.</span>
            </h1>
            <p className="text-base text-text-secondary max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Routiqo helps logistics teams automate dispatching, optimize delivery routes, and track fleet operations in real-time. Efficiency at every mile.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={openAuth}
                className="btn-primary px-6 py-3 text-sm flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Get Started 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 grayscale opacity-40">
              <div className="flex items-center gap-2">
                <Zap size={14} />
                <span className="text-xs font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} />
                <span className="text-xs font-medium">Enterprise Security</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Illustration */}
        <div className="flex-1 relative flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 w-full max-w-[500px]"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white">
              <img 
                src="/hero.png" 
                alt="Routiqo Platform Illustration" 
                className="w-full h-auto object-cover"
              />
            </div>
            
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 bg-white p-3 rounded-xl shadow-xl border border-gray-100 hidden md:flex items-center gap-2.5"
            >
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <Truck size={16} />
              </div>
              <div>
                <p className="text-[8px] text-text-secondary uppercase tracking-wider font-bold">Active Fleet</p>
                <p className="text-base font-bold text-dark">128 Trucks</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-4 bg-dark text-white p-4 rounded-xl shadow-2xl hidden md:block"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-dark">
                  <MapPin size={14} />
                </div>
                <span className="text-sm font-semibold">Live Tracking</span>
              </div>
              <div className="space-y-1.5">
                <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full bg-primary" 
                  />
                </div>
                <div className="w-16 h-1 bg-gray-700 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
          
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-[100px] rounded-full -z-10" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
