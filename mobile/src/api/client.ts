import axios from 'axios';
import { Platform } from 'react-native';

// ─── 서버 주소 설정 ────────────────────────────────────────────────────────────
// 안드로이드 에뮬레이터: 10.0.2.2 (host loopback)
// 안드로이드 실기기:     PC의 실제 IP 주소 (예: 192.168.0.x)
// iOS 시뮬레이터:        localhost
// ─────────────────────────────────────────────────────────────────────────────
const DEV_HOST = Platform.OS === 'android'
  ? '10.100.0.230'  // 실기기: PC LAN IP (에뮬레이터는 10.0.2.2로 변경)
  : 'localhost';

const BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3031/api/v1`
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
