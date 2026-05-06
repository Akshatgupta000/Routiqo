import { useState } from 'react';

const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('signup'); // 'login' or 'signup'

  const openModal = (initialMode = 'signup') => {
    setMode(initialMode);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  return {
    isOpen,
    mode,
    setMode,
    openModal,
    closeModal,
    toggleMode,
  };
};

export default useAuthModal;
