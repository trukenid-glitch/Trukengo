const express = require("express");
const router = express.Router();
const {
  getBaseLocation,
  updateLocation,
  updateAppConfig,
  addStore,
  getAllStores,
  updateStore,
  deleteStore,
} = require("../controllers/adminController");

// 1. IMPORT MIDDLEWARE BARU KITA NDES!
const { verifyToken, authorizeRole } = require("../middlewares/authMiddleware");

const customerController = require("../controllers/customerControllers");
const multer = require("multer");

// Konfigurasi Multer (Simpan di RAM sementara sebelum diterusin ke R2)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Batasi 5MB per foto biar server gak berat
  },
});

// Middleware untuk nangkep dua jenis upload sekaligus
const storeUpload = upload.fields([
  { name: "product_photos", maxCount: 5 },
  { name: "menu_photos", maxCount: 20 },
]);

// Buat shortcut biar gak kepanjangan nulisnya di route nanti
const adminProtection = [verifyToken, authorizeRole("admin")];

// --- ROUTES ---

// Ambil lokasi (Admin wajib login)
router.get("/base-location", adminProtection, getBaseLocation);

// Ambil lokasi (Public/Customer bisa akses buat cek ongkir - tanpa proteksi)
router.get("/base-location-open", getBaseLocation);

// Update lokasi (Hanya Admin)
router.put("/update-location", adminProtection, updateLocation);

// Update konfigurasi tarif Jastip (Hanya Admin)
router.put("/config", adminProtection, updateAppConfig);

// Tambah Toko Baru (Hanya Admin + Handle Foto)
router.post("/stores", adminProtection, storeUpload, addStore);

// Ambil semua toko untuk admin
router.get("/fetch-stores", adminProtection, getAllStores);

// Detail toko admin
router.get("/manage-stores/:id", adminProtection, customerController.getStoreDetail);

// Update toko admin (Handle foto juga)
router.put("/manage-stores/:id", adminProtection, storeUpload, updateStore);

// Hapus toko admin
router.delete("/manage-stores/:id", adminProtection, deleteStore);

module.exports = router;