import React from 'react';
import { motion } from 'framer-motion';

const TrustedBy = () => {
  const partners = ['Amazon', 'Uber', 'FedEx', 'Delhivery', 'Zoom'];

  return (
    <section className="py-20 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm font-bold text-text-secondary uppercase tracking-[0.2em] mb-10">
          Trusted by Industry Leaders
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((partner) => (
            <motion.span 
              key={partner}
              whileHover={{ scale: 1.1, opacity: 1 }}
              className="text-2xl md:text-3xl font-bold text-dark cursor-default select-none"
            >
              {partner}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
