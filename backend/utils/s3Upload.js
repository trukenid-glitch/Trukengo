// src/utils/s3Upload.js

const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
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

const getR2KeyFromUrl = (fileUrl) => {
  try {
    const url = new URL(fileUrl);
    let key = url.pathname.replace(/^\/+/, "");
    if (key.startsWith("trukengo-storage/")) {
      key = key.slice("trukengo-storage/".length);
    }
    return key;
  } catch (err) {
    console.error("R2 Delete helper invalid URL:", fileUrl, err);
    return null;
  }
};

const deleteFromR2 = async (fileUrl) => {
  const Key = getR2KeyFromUrl(fileUrl);
  if (!Key) {
    throw new Error(`Invalid R2 URL: ${fileUrl}`);
  }

  const params = {
    Bucket: "trukengo-storage",
    Key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    return true;
  } catch (err) {
    console.error("R2 Delete Error:", err, fileUrl);
    throw err;
  }
};

// Export menggunakan gaya CommonJS
module.exports = { uploadToR2, deleteFromR2 };