const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Ijin buat Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
 // Ijin buat frontend
app.use(express.json()); // Biar bisa baca JSON dari frontend

app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);

// ROUTES DASAR
app.get("/", (req, res) => {
  res.send("✅ Backend Truken Jastip Is Running, Ndes!");
});

app.listen(port, () => {
  console.log(`🚀 Server meluncur di http://localhost:${port}`);
});
