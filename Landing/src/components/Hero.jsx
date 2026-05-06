import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, MapPin, Truck, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-dark font-semibold text-sm mb-6 border border-primary/20">
              New: AI-Powered Dispatching v4.0
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-dark leading-[1.1] mb-6">
              Optimize Your Fleet. <br />
              <span className="text-primary bg-dark px-4 py-1 rounded-2xl inline-block mt-2">Deliver Smarter.</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Routiqo helps logistics teams automate dispatching, optimize delivery routes, and track fleet operations in real-time. Efficiency at every mile.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button className="btn-primary flex items-center gap-2 group w-full sm:w-auto justify-center">
                Get Started Free 
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center">
                <Play size={18} fill="currentColor" />
                View Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 grayscale opacity-50">
              <div className="flex items-center gap-2">
                <Zap size={16} />
                <span className="text-sm font-medium">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Illustration */}
        <div className="flex-1 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="/hero.png" 
                alt="Routiqo Platform Illustration" 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 hidden md:flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Active Fleet</p>
                <p className="text-lg font-bold text-dark">128 Trucks</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-6 bg-dark text-white p-5 rounded-2xl shadow-2xl hidden md:block"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-dark">
                  <MapPin size={16} />
                </div>
                <span className="font-semibold">Live Tracking</span>
              </div>
              <div className="space-y-2">
                <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full bg-primary" 
                  />
                </div>
                <div className="w-24 h-1.5 bg-gray-700 rounded-full" />
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
