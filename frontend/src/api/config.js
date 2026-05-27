import axios from 'axios';

// URL API dari .env (Vercel) atau localhost (Development)
export const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

// Buat instance axios agar tidak perlu ketik URL berulang-ulang
const api = axios.create({
  baseURL: API_URL,
});

// INTERCEPTOR: Otomatis sisipkan role ke setiap request
api.interceptors.request.use((config) => {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    const user = JSON.parse(userJson);
    // Kita titipkan role di header bernama 'x-role'
    config.headers['x-role'] = user.role;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;