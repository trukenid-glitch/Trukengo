const express = require("express");
const router = express.Router();
const {
  getBaseLocation,
  updateLocation,
  addStore,
  getAllStores,
  updateStore,
  deleteStore,
} = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/authMiddleware");
const customerController = require("../controllers/customerControllers");

// GUNAKAN REQUIRE biar seragam sama yang atas, ndes!
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

// --- ROUTES ---

// Ambil lokasi (Admin wajib login)
router.get("/base-location", isAdmin, getBaseLocation);

// Ambil lokasi (Public/Customer bisa akses buat cek ongkir)
router.get("/base-location-open", getBaseLocation);

// Update lokasi (Hanya Admin)
router.put("/update-location", isAdmin, updateLocation);

// Tambah Toko Baru (Hanya Admin + Handle Foto)
router.post("/stores", isAdmin, storeUpload, addStore);

router.get("/fetch-stores", isAdmin, getAllStores);
router.get("/manage-stores/:id", isAdmin, customerController.getStoreDetail);
// Gunakan `storeUpload` di route update juga supaya `req.body`/`req.files` terisi saat frontend kirim FormData
router.put("/manage-stores/:id", isAdmin, storeUpload, updateStore);
router.delete("/manage-stores/:id", isAdmin, deleteStore);
module.exports = router;
