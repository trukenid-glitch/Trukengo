const pool = require('../db');

exports.getStores = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;
        const search = req.query.search || ""; // Ambil keyword search dari frontend

        // Tambahkan klausa WHERE jika ada keyword search
        let queryCondition = "WHERE is_open = true";
        let queryParams = [limit, offset];

        if (search.trim() !== "") {
            queryCondition += " AND store_name ILIKE $3";
            queryParams.push(`%${search}%`); // Mencari nama toko yang mengandung kata tersebut
        }

        // Query utama dengan LIMIT, OFFSET, dan SEARCH
        const query = `
            SELECT id, product_photos, store_name, category, price, address 
            FROM stores 
            ${queryCondition}
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(query, queryParams);

        // Hitung total stores berdasarkan kondisi search juga
        let totalQueryStr = "SELECT COUNT(*) FROM stores WHERE is_open = true";
        if (search.trim() !== "") {
            totalQueryStr += " AND store_name ILIKE $1";
        }
        const totalQuery = await pool.query(
            totalQueryStr, 
            search.trim() !== "" ? [`%${search}%`] : []
        );
        
        const totalStores = parseInt(totalQuery.rows[0].count);
        const hasMore = offset + result.rows.length < totalStores;

        res.json({ 
            status: "success", 
            data: result.rows,
            hasMore: hasMore 
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