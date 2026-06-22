const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // Ambil token dari cookies (pastikan backend pakai cookie-parser)
    const token = req.cookies?.token;

    if (!token) {
        return res.status(403).json({
            status: "error",
            message: "Akses ditolak, kamu belum login ndes!"
        });
    }

    try {
        // Verifikasi token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Simpan data user (id, username, role) ke req agar bisa dipakai di controller berikutnya
        next(); // Lanjut ke fungsi controller utama
    } catch (err) {
        res.status(401).json({
            status: "error",
            message: "Token tidak valid atau sudah kedaluwarsa!"
        });
    }
};

// Bonus: Middleware khusus cek role (misal untuk proteksi admin)
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "error",
                message: "Kamu tidak punya akses ke halaman ini!"
            });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRole };