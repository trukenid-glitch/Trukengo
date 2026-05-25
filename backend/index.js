const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors()); // Ijin buat frontend
app.use(express.json()); // Biar bisa baca JSON dari frontend

// ROUTES DASAR
app.get('/', (req, res) => {
  res.send('✅ Backend Truken Jastip Is Running, Ndes!');
});

// CONTOH ENDPOINT CEK ONGKIR (Bisa kamu kembangkan nanti)
app.post('/api/cek-ongkir', (req, res) => {
  const { asal, tujuan } = req.body;
  // Nanti logika hitung harga yang rumit bisa ditaruh di sini
  res.json({
    status: "success",
    message: "Data diterima di backend",
    data: { asal, tujuan }
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Cek jam di database
    res.json({ 
      message: "Koneksi database aman, ndes!", 
      time: result.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Gagal ambil data ke database");
  }
});

app.listen(port, () => {
  console.log(`🚀 Server meluncur di http://localhost:${port}`);
});

