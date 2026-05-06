import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    password_confirmation: '',
  });

  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (step === 3) {
      let score = 0;
      if (formData.password.length >= 8) score++;
      if (/[A-Z]/.test(formData.password)) score++;
      if (/[0-9]/.test(formData.password)) score++;
      if (/[^A-Za-z0-9]/.test(formData.password)) score++;
      setStrength(score);
    }
  }, [formData.password, step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.forgotPassword(formData.email);
      if (data.success) {
        setStep(2);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.verifyOtp(formData.email, formData.otp);
      if (data.success) {
        setStep(3);
      } else {
        setError(data.message || 'Invalid or expired code');
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.resetPassword(
        formData.email,
        formData.otp,
        formData.password,
        formData.password_confirmation
      );
      if (data.success) {
        setStep(4); // Success state
        setTimeout(() => navigate('/?login=true'), 3000);
      } else {
        setError(data.message || 'Reset failed.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-soft">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-premium border border-gray-100"
      >
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-dark/60 hover:text-dark transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
              <p className="text-dark/60 mb-8">
                Enter your email address and we'll send you a 6-digit verification code.
              </p>
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-2 py-4">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Send Verification Code'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-2">Verify Code</h2>
              <p className="text-dark/60 mb-8">
                We've sent a 6-digit code to <strong>{formData.email}</strong>. Enter it below to continue.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40 group-focus-within:text-primary transition-colors">
                    <Key size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="6-Digit Code"
                    required
                    maxLength={6}
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono tracking-[0.5em] text-center focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                <p className="text-[10px] text-center text-dark/40 -mt-2 italic">
                  Didn't receive a code? Check your **Spam** folder.
                </p>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-2 py-4">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-dark/40 hover:text-dark transition-colors">
                  Change Email
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-3xl font-bold mb-2">New Password</h2>
              <p className="text-dark/60 mb-8">
                Verification successful! Create a new secure password for your account.
              </p>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40 group-focus-within:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New Password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="flex gap-1 h-1.5 px-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i <= strength ? (strength <= 2 ? 'bg-orange-400' : 'bg-primary') : 'bg-gray-100'}`} />
                    ))}
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40 group-focus-within:text-primary transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      required
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full btn-primary flex items-center justify-center gap-2 py-4">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-4">Password Updated!</h2>
              <p className="text-dark/60 mb-8">
                Your password has been reset successfully. Redirecting you to login...
              </p>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }} className="h-full bg-primary" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
