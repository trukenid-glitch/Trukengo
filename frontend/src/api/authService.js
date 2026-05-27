import api from './config';

export const loginUser = async (username, password) => {
  try {
    // Tembak ke endpoint POST /api/auth/login
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    // Tangkap error dari backend (misal: "Username salah")
    throw error.response?.data?.message || "Terjadi kesalahan pada server";
  }
};