import axios from 'axios';

// URL API dari .env (Vercel) atau localhost (Development)
export const API_URL = `${import.meta.env.VITE_API_URL || 'http://10.184.255.12:5000'}/api`;

// Buat instance axios agar tidak perlu ketik URL berulang-ulang
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 👈 PENTING BANGET! Supaya cookie otomatis ikut dikirim ke backend disetiap request
});

export default api;