const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // 1. Import cookie-parser ndes
const pool = require("./db");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');

const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;
const URL_BACKEND = "https://trukengo.onrender.com/api/ping";

// 2. KONFIGURASI CORS (PENTING BANGET UNTUK COOKIE)
// Catatan: Jika credentials: true, 'origin' TIDAK BOLEH '*'
app.use(cors({
  origin: [
    'http://localhost:5173', // URL local frontend (Vite/React biasanya port ini)
    'https://namadomain-frontendmu.vercel.app', 
    'http://10.184.255.12:5173', // Nanti ganti pakai URL Vercel produksimu ndes
  ], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Mengizinkan browser mengirim & menerima cookie
}));

// MIDDLEWARE UTAMA
app.use(express.json()); // Biar bisa baca JSON dari frontend
app.use(cookieParser()); // 3. Gunakan cookie-parser di sini agar req.cookies terbaca!

// ROUTES UTAMA
app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

app.get('/api/ping', (req, res) => {
  res.send("Hadir, ndes!");
});

// Fitur pencegah Render tidur (Wake-up cron)
setInterval(() => {
  axios.get(URL_BACKEND)
    .then(() => console.log("✅ Render disenggol: Server melek terus!"))
    .catch((err) => console.log("⚠️ Gagal nyenggol, mungkin server lagi restart."));
}, 13 * 60 * 1000);

// ROUTES DASAR
app.get("/", (req, res) => {
  res.send("✅ Backend Truken Jastip Is Running, Ndes!");
});

app.listen(port, () => {
  console.log(`🚀 Server meluncur di http://localhost:${port}`);
});