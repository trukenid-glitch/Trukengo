const pool = require('../db');

// Login
exports.userLogin = async (req, res) => {
    const { username, password } = req.body;

    console.log("Input dari Frontend:", { username, password });
    
    try {
        // 1. Cek apakah ada user yang username DAN password-nya cocok dalam satu baris
        // Kita ambil semua kolomnya (*) biar dapet role-nya juga
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2", 
            [username, password]
        );

        console.log("Hasil Query Database:", result.rows);

        // 2. Kalau tidak ada baris yang cocok (rows.length === 0)
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                status: "error",
                message: "Username atau Password salah" 
            });
        }

        // 3. Kalau cocok, ambil data usernya
        const user = result.rows[0];

        // 4. Kirim data sukses beserta ROLE-nya ke frontend
        res.json({
            status: "success",
            message: `Login Berhasil sebagai ${user.role}`,
            data: {
                id: user.id,
                username: user.username,
                role: user.role, // Di sini kuncinya ndes!
                no_wa: user.no_wa,
                full_name: user.full_name
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            status: "error",
            message: "Aduh, server lagi pusing ndes!" 
        });
    }
};