import api from './config';

// Ambil lokasi saat ini dari DB
export const getBaseLocation = async () => {
  try {
    const response = await api.get('/admin/base-location');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gagal ambil lokasi";
  }
};

export const getBaseLocationOpen = async () => {
  try {
    const response = await api.get('/admin/base-location-open');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gagal ambil lokasi";
  }
};

// Update lokasi baru ke DB
export const updateBaseLocation = async (lat, lng, address) => {
  try {
    const response = await api.put('/admin/update-location', { lat, lng, address });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Gagal update lokasi";
  }
};