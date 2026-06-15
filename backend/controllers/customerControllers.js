const pool = require('../db');

// Ambil semua toko untuk katalog menu
exports.getStores = async (req, res) => {
    try {
        // Ambil page dan limit dari query string, kasih default kalau kosong
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // Query dengan LIMIT dan OFFSET
        const query = `
            SELECT id, product_photos, store_name, category, price, address 
            FROM stores 
            WHERE is_open = true 
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, [limit, offset]);

        // Hitung total semua toko yang buka untuk info hasMore di frontend
        const totalQuery = await pool.query("SELECT COUNT(*) FROM stores WHERE is_open = true");
        const totalStores = parseInt(totalQuery.rows[0].count);
        const hasMore = offset + result.rows.length < totalStores;

        res.json({ 
            status: "success", 
            data: result.rows,
            hasMore: hasMore // Kasih tau frontend apakah masih ada data selanjutnya
        });
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

// Ambil konfigurasi pricing dari database
exports.getAppConfig = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM app_configs LIMIT 1');
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Konfigurasi pricing tidak ditemukan!' });
        }
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};