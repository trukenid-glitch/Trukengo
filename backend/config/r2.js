// src/config/r2.js

const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();

// Inisialisasi koneksi ke Cloudflare R2 menggunakan S3 Client gaya CommonJS
const s3Client = new S3Client({
  region: "auto", 
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = { s3Client };