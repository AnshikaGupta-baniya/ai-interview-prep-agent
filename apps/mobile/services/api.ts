import axios from 'axios';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://interview-prep-agent-cmle.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  console.log('API Base URL:', API_URL);
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;