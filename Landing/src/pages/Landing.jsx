import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustedBy from '../components/TrustedBy';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import UseCases from '../components/UseCases';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-0 md:p-4 lg:p-6">
      {/* Main Container Card */}
      <div className="mx-auto max-w-[1600px] bg-white rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/50">
        <Navbar />
        
        <main>
          <Hero />
          <TrustedBy />
          <Features />
          <HowItWorks />
          <UseCases />
          <CTA />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
