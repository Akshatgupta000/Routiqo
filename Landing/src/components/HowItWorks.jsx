import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Settings2, CheckCircle2 } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      title: "Add Orders",
      desc: "Import your orders via API, CSV, or direct dashboard entry in seconds.",
      icon: <ClipboardList className="w-6 h-6" />,
    },
    {
      title: "Optimize Routes",
      desc: "Our AI engine calculates the most efficient paths based on traffic and constraints.",
      icon: <Settings2 className="w-6 h-6" />,
    },
    {
      title: "Deliver Efficiently",
      desc: "Dispatch routes to drivers and track every delivery until it reaches the customer.",
      icon: <CheckCircle2 className="w-6 h-6" />,
    }
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-dark mb-4">How It Works</h2>
          <p className="text-text-secondary text-lg">Streamline your entire delivery process in three simple steps.</p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center text-center bg-white p-8 rounded-3xl"
              >
                <div className="w-16 h-16 bg-dark text-primary rounded-2xl flex items-center justify-center mb-8 shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
                  {step.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-primary text-dark font-bold text-sm flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-dark">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
