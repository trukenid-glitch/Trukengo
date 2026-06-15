import api from './config';

export const getAllStores = async (page = 1, limit = 5, search = "") => {
  try {
    // Masukkan variable search ke dalam query URL
    const response = await api.get(`/customer/stores?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gagal memuat menu!";
  }
};

// Ambil detail toko tertentu
export const getStoreDetail = async (id) => {
  try {
    const response = await api.get(`/customer/stores/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gagal memuat detail toko!";
  }
};

// Ambil konfigurasi pricing dari backend
export const getPricingConfig = async () => {
  try {
    const response = await api.get('/customer/config');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gagal memuat konfigurasi harga!";
  }
};