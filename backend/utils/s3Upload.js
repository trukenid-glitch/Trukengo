// src/utils/s3Upload.js

const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../config/r2"); // Hilangkan ekstensi .js kalau pakai require
const path = require("path");

const uploadToR2 = async (file, folder) => {
  // Membuat nama file unik agar tidak saling tumpang tindih di R2
  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
  
  const params = {
    Bucket: "trukengo-storage",
    Key: fileName,
    Body: file.buffer, // Mengambil data buffer dari Multer memoryStorage
    ContentType: file.mimetype,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    // Mengembalikan URL publik file yang berhasil di-upload
    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  } catch (err) {
    console.error("R2 Upload Error:", err);
    throw new Error("Gagal upload ke Cloudflare R2, ndes!");
  }
};

// Export menggunakan gaya CommonJS
module.exports = { uploadToR2 };