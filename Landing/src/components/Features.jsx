import React from 'react';
import { motion } from 'framer-motion';
import { Route, Map, BarChart3, ShieldCheck, ArrowUpRight } from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: "Route Optimization",
      desc: "Advanced algorithms to reduce mileage, fuel costs, and delivery time by up to 35%.",
      icon: <Route className="w-8 h-8" />,
      dark: false,
    },
    {
      title: "Real-Time Tracking",
      desc: "Monitor every vehicle, driver, and shipment in real-time with precise GPS tracking.",
      icon: <Map className="w-8 h-8" />,
      dark: true,
    },
    {
      title: "Fleet Management",
      desc: "Manage vehicle maintenance, fuel usage, and driver performance in one dashboard.",
      icon: <ShieldCheck className="w-8 h-8" />,
      dark: true,
    },
    {
      title: "Smart Dispatching",
      desc: "Automated order assignment based on driver proximity, capacity, and current workload.",
      icon: <BarChart3 className="w-8 h-8" />,
      dark: false,
    }
  ];

  return (
    <section id="features" className="py-24 px-4 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-dark mb-4"
          >
            Powerful Features for Modern Logistics
          </motion.h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Everything you need to manage a high-performance delivery operation at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`p-10 rounded-3xl border transition-all duration-300 group cursor-pointer ${
                f.dark 
                ? 'bg-dark text-white border-dark shadow-2xl' 
                : 'bg-white text-dark border-gray-100 shadow-xl'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-300 ${
                f.dark ? 'bg-primary text-dark' : 'bg-dark text-white'
              }`}>
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
              <p className={`text-lg mb-8 leading-relaxed ${f.dark ? 'text-gray-400' : 'text-text-secondary'}`}>
                {f.desc}
              </p>
              <button className={`flex items-center gap-2 font-bold group/btn ${
                f.dark ? 'text-primary' : 'text-dark'
              }`}>
                Learn more 
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all group-hover/btn:translate-x-1 ${
                  f.dark ? 'bg-primary/10' : 'bg-dark/5'
                }`}>
                  <ArrowUpRight size={16} />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
