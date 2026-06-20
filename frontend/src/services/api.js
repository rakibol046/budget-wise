import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach JWT from Zustand store on every request
api.interceptors.request.use((config) => {
  // Dynamic import avoids circular dependency between api.js and authStore
  const stored = localStorage.getItem('budget-auth');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch {
      // malformed storage — ignore
    }
  }
  return config;
});

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('budget-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
