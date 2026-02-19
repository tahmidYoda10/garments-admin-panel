// src/api/http.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Request interceptor – Authorization header যোগ করা
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAccessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Response interceptor – 401 Unauthorized হ্যান্ডেল করা
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // যদি 401 Unauthorized হয় এবং এটি refreshToken request না হয়
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // একবারের জন্য retry ফ্ল্যাগ সেট করা

      try {
        const refreshToken = localStorage.getItem('adminRefreshToken');
        if (!refreshToken) {
          // যদি refreshToken না থাকে, সরাসরি লগইন পেজে রিডাইরেক্ট করো
          localStorage.clear();
          window.location.href = '/admin/login'; // Hard reload to login page
          return Promise.reject(error);
        }

        // refreshToken ব্যবহার করে নতুন accessToken আনার চেষ্টা করো
        const res = await axios.post('http://localhost:8080/api/v1/auth/refresh-token', { refreshToken });
        const newAccessToken = res.data.data.accessToken;
        const newRefreshToken = res.data.data.refreshToken;

        // নতুন টোকেন localStorage এ সেভ করো
        localStorage.setItem('adminAccessToken', newAccessToken);
        localStorage.setItem('adminRefreshToken', newRefreshToken);

        // নতুন টোকেন দিয়ে অরিজিনাল রিকোয়েস্টটি আবার চেষ্টা করো
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError: any) {
        // refreshToken ফেইল করলে, লগইন পেজে রিডাইরেক্ট করো
        console.error('Failed to refresh token:', refreshError);
        localStorage.clear();
        window.location.href = '/admin/login'; // Hard reload to login page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;