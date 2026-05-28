import api from './api';

let intervalId: ReturnType<typeof setInterval> | null = null;

export const startKeepAlive = () => {
  // Ping every 10 minutes to prevent Render from sleeping
  if (intervalId) return;

  intervalId = setInterval(async () => {
    try {
      await api.get('/health');
      if (__DEV__) console.log('Keep-alive ping sent');
    } catch (err) {
      if (__DEV__) console.log('Keep-alive ping failed:', err);
    }
  }, 10 * 60 * 1000); // 10 minutes

  // Also ping immediately on start
  api.get('/health').catch(() => {});
};

export const stopKeepAlive = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};