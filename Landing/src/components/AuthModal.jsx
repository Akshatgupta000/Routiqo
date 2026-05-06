import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, initialMode = 'signup' }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setIsLoading(false);
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = mode === 'signup' ? '/register' : '/login';
      const response = await fetch(`http://localhost:8000/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token and user info (local to landing)
      localStorage.setItem('auth_token', data.data.access_token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      setIsLoading(false);
      onClose();

      // Redirect to dashboard with token in URL (cross-origin fix for dev)
      const userData = encodeURIComponent(JSON.stringify(data.data.user));
      window.location.href = `http://localhost:5174?token=${data.data.access_token}&user=${userData}`;
    } catch (error) {
      console.error('Auth error:', error);
      alert(error.message);
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
            >
              <X size={18} />
            </button>

            <div className="p-7 pt-10">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-sm text-white/60">
                  {mode === 'signup' 
                    ? 'Join Routiqo to start optimizing your fleet.' 
                    : 'Log in to manage your logistics operations.'}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/10">
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    mode === 'signup' 
                      ? 'bg-primary text-dark shadow-lg' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    mode === 'login' 
                      ? 'bg-primary text-dark shadow-lg' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Log In
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {mode === 'signup' && (
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors">
                          <User size={18} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                      </div>
                    )}

                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors">
                        <Mail size={16} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>

                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {mode === 'login' && (
                  <div className="text-right">
                    <button type="button" className="text-[10px] text-white/40 hover:text-primary transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 mt-4 flex items-center justify-center gap-2 group relative overflow-hidden text-sm"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {mode === 'signup' ? 'Create Account' : 'Sign In'}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Toggle */}
              <div className="mt-8 text-center">
                <p className="text-white/40 text-sm">
                  {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                    className="text-primary font-bold hover:underline"
                  >
                    {mode === 'signup' ? 'Log In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-2 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
