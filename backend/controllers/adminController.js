const pool = require('../db');
const { uploadToR2 } = require('../utils/s3Upload')

// Ambil lokasi basecamp saat ini
exports.getBaseLocation = async (req, res) => {
    try {
        // Kita ambil dari user yang rolenya admin (asumsi cuma ada 1 super admin)
        const result = await pool.query(
            "SELECT latitude, longitude, base_address FROM users WHERE role = 'admin' LIMIT 1"
        );
        res.json({ status: "success", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update lokasi basecamp
exports.updateLocation = async (req, res) => {
    const { lat, lng, address } = req.body;
    try {
        // Update koordinat untuk semua user admin (atau admin tertentu)
        await pool.query(
            "UPDATE users SET latitude = $1, longitude = $2, base_address = $3 WHERE role = 'admin'",
            [lat, lng, address]
        );
        res.json({ status: "success", message: "Lokasi diperbarui!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addStore = async (req, res) => {
    try {
        const { 
            store_name, category, description, operating_hours, 
            address, latitude, longitude, price, estimate 
        } = req.body;

        // Validasi field wajib
        if (!store_name || !category || !address || !latitude || !longitude) {
            return res.status(400).json({
                status: "error",
                message: "Field store_name, category, address, latitude, longitude wajib diisi!"
            });
        }

        // Ambil file dari Multer - dengan validasi jika undefined
        const productFiles = req.files?.['product_photos'] || [];
        const menuFiles = req.files?.['menu_photos'] || [];

        // Proses Upload ke R2 secara paralel (jika ada file)
        const product_urls = productFiles.length > 0 
            ? await Promise.all(productFiles.map(file => uploadToR2(file, "product_photos")))
            : [];

        const menu_urls = menuFiles.length > 0 
            ? await Promise.all(menuFiles.map(file => uploadToR2(file, "menu_photos")))
            : [];

        // Logging hasil upload untuk memudahkan debug wsrv/R2 URL
        const query = `
            INSERT INTO stores (
                store_name, category, description, operating_hours, 
                address, latitude, longitude, price, estimate, 
                product_photos, menu_photos
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

        const values = [
            store_name, category, description, operating_hours, 
            address, latitude, longitude, price || 0, estimate || null, 
            product_urls, // Hasil array URL dari R2 (bisa kosong)
            menu_urls     // Hasil array URL dari R2 (bisa kosong)
        ];

        const result = await pool.query(query, values);

        // Sertakan juga url hasil upload di response untuk verifikasi cepat
        res.status(201).json({
            status: "success",
            message: "Toko dan Foto berhasil disimpan ke Cloudflare R2!",
            data: result.rows[0],
            uploaded: {
                product_urls,
                menu_urls
            }
        });

    } catch (err) {
        console.error("Error Add Store:", err.message);
        res.status(500).json({ 
            status: "error", 
            message: "Gagal simpan toko: " + err.message 
        });
    }
};