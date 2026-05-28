import api from './config';

// Ambil semua daftar toko untuk katalog
export const getAllStores = async () => {
  try {
    const response = await api.get('/customer/stores');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gagal memuat menu, ndes!";
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