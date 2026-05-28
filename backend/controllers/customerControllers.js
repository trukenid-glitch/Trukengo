const pool = require('../db');

// Ambil semua toko untuk katalog menu
exports.getStores = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, product_photos, store_name, category, price, address FROM stores WHERE is_open = true ORDER BY created_at DESC"
        );
        res.json({ status: "success", data: result.rows });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Ambil detail toko berdasarkan ID
exports.getStoreDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM stores WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Toko tidak ditemukan!" });
        }
        res.json({ status: "success", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};