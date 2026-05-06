import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import UseCases from '../components/UseCases';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import useAuthModal from '../hooks/useAuthModal';

const Landing = () => {
  const { isOpen, mode, openModal, closeModal } = useAuthModal();

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-0 md:p-3 lg:p-4">
      {/* Main Container Card */}
      <div className="mx-auto max-w-[1440px] bg-white rounded-none md:rounded-[2.5rem] shadow-2xl overflow-visible relative border border-white/50">
        <Navbar 
          openSignup={() => openModal('signup')} 
          openLogin={() => openModal('login')} 
        />
        
        <main>
          <Hero openAuth={() => openModal('signup')} />
          <Features />
          <HowItWorks />
          <UseCases />
        </main>
        
        <Footer />
      </div>

      <AuthModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        initialMode={mode} 
      />
    </div>
  );
};

export default Landing;
