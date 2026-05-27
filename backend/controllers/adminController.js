const pool = require('../db');

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