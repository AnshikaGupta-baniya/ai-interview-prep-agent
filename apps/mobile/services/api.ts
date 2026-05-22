import axios from 'axios';

// Base API client — all requests go through here
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — log in dev
api.interceptors.request.use((config) => {
  if (__DEV__) console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (__DEV__) console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
