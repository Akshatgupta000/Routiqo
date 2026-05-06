import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Pizza, Package, ArrowRight } from 'lucide-react';

const UseCases = () => {
  const cases = [
    {
      title: "E-commerce",
      desc: "Scale your delivery operations during peak seasons without adding overhead.",
      metric: "30% faster delivery",
      icon: <ShoppingBag className="w-10 h-10" />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Food Delivery",
      desc: "Ensure hot meals arrive on time with ultra-fast routing and real-time alerts.",
      metric: "25% lower fuel costs",
      icon: <Pizza className="w-10 h-10" />,
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Courier Services",
      desc: "Manage complex last-mile delivery networks with pinpoint accuracy.",
      metric: "98% On-time rate",
      icon: <Package className="w-10 h-10" />,
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <section id="use-cases" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Designed for Every Industry</h2>
            <p className="text-lg text-text-secondary">Routiqo is flexible enough to power logistics for any business size or type.</p>
          </div>
          <button className="text-dark font-bold flex items-center gap-2 hover:gap-4 transition-all text-sm">
            Explore all use cases <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.map((c, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white border border-gray-100 p-6 rounded-3xl hover:shadow-2xl hover:border-transparent transition-all duration-500"
            >
              <div className={`w-16 h-16 ${c.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className="scale-90">{c.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">{c.title}</h3>
              <p className="text-text-secondary text-base mb-6 leading-relaxed">{c.desc}</p>
              
              <div className="pt-4 border-t border-gray-50">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary block mb-2">Success Metric</span>
                <span className="text-xl font-bold text-primary bg-dark px-3 py-1.5 rounded-lg inline-block">{c.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
