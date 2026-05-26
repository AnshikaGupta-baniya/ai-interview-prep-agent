import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',  // ← this skips ngrok's HTML warning page
  },
});

api.interceptors.request.use((config) => {
  if (__DEV__) console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (__DEV__) console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;