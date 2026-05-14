import axios from 'axios';

// ─── Port assignment ──────────────────────────────────────────────────────────
// debugfit_claude : Backend 3001
// debugfit_cursor : Backend 3011
// GonguManager    : Backend 3021
// 오늘의가족       : Backend 3031  ← this project
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = __DEV__
  ? 'http://localhost:3031/api/v1'
  : 'https://your-render-url.onrender.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const { token } = require('@/store/authStore').useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      require('@/store/authStore').useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);

export default api;
