const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Tes koneksi pas aplikasi jalan
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Gagal nyambung ke database, ndes!', err.stack);
  }
  console.log('✅ Mantap! Database PostgreSQL nyambung!');
  release();
});

module.exports = pool;