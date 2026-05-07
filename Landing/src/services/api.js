import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// Request interceptor for Bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // Unwrap Laravel response structure if it follows { success: true, data: ... }
        if (response.data && response.data.success === true && response.data.data !== undefined) {
            return { ...response, data: response.data.data };
        }
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            // Optional: redirect to login or trigger global state reset
        }
        return Promise.reject(error);
    }
);

export default api;
