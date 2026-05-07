import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token if present
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
      }
      
      return response.data;
    } catch (err) {
      console.error('[Auth] Login error:', err);
      throw err;
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      // Store token if present
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
      }
      
      return response.data;
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      throw err;
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (email, otp, password, password_confirmation) => {
    const response = await api.post('/auth/reset-password', { 
      email, 
      otp, 
      password, 
      password_confirmation 
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  }
};

export default authService;
