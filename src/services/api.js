import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api',
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;

function clearAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const { data } = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(import.meta.env.VITE_MOBILE_APP_API_KEY
            ? { 'X-DeviceKart-App-Key': import.meta.env.VITE_MOBILE_APP_API_KEY }
            : {}),
        },
      }
    );

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// Request interceptor — attach access token + optional mobile/app API key
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const appKey = import.meta.env.VITE_MOBILE_APP_API_KEY;
  if (appKey) {
    config.headers['X-DeviceKart-App-Key'] = appKey;
  }
  return config;
});

// Response interceptor — auto-refresh on 401 (single-flight, no parallel refresh races)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const url = String(originalRequest.url || '');
    const isAuthRefresh = url.includes('/auth/refresh');
    const isAuthLogin = url.includes('/auth/send-otp') || url.includes('/auth/verify-otp');

    if (status === 401 && !originalRequest._retry && !isAuthRefresh && !isAuthLogin) {
      originalRequest._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthStorage();
        const returnUrl = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`
        );
        window.location.href = `/login?returnUrl=${returnUrl}`;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
