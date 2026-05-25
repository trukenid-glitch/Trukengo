// src/utils/constants.js

// Koordinat Admin (Contoh: Area Kendal/Semarang)
export const ADMIN_LOCATION = { lat: -6.963013, lng: 110.146176 }; 

export const PRICING_CONFIG = {
  PICKUP_FEE_PER_KM: 1000,    // Admin ke Toko
  DELIVERY_FEE_PER_KM: 2000,  // Toko ke Customer
  FIXED_JASTIP_FEE: 2000,    // Fee Jastip Tetap
};

export const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
};