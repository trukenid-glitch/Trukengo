const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes')

const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;
const URL_BACKEND = "https://trukengo.onrender.com/api/ping";

// MIDDLEWARE
app.use(cors({
  origin: '*', // Ijin buat Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
 // Ijin buat frontend
app.use(express.json()); // Biar bisa baca JSON dari frontend

app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

app.get('/api/ping', (req, res) => {
  res.send("Hadir, ndes!");
});

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
