const pool = require('../db');

// Login
const jwt = require("jsonwebtoken");

exports.userLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Cek user ke database
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2", 
            [username, password]
        );

        // 2. Kalau salah
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                status: "error",
                message: "Username atau Password salah" 
            });
        }

        const user = result.rows[0];

        // 3. Buat JWT Token
        // Kita masukkan id, username, dan role ke dalam payload token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // Token hangus dalam 1 hari
        );

        // 4. Taruh token di HttpOnly Cookie
        res.cookie("token", token, {
            httpOnly: true,                 // JavaScript frontend ga akan bisa baca token ini (Aman dari XSS)
            secure: true, // Wajib HTTPS kalau sudah production
            sameSite: "none", 
            maxAge: 24 * 60 * 60 * 1000    // Expired cookie (1 hari dalam milidetik)
        });

        // 5. Kirim data sukses ke frontend (TANPA mengirim token di body JSON)
        res.json({
            status: "success",
            message: `Login Berhasil sebagai ${user.role}`,
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
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