exports.isAdmin = (req, res, next) => {
    // Ambil role dari header yang dikirim Axios tadi
    const userRole = req.headers['x-role']; 

    if (userRole === 'admin') {
        next(); // Silakan lewat ndes!
    } else {
        res.status(403).json({ 
            status: "error",
            message: "Dilarang masuk! Ini wilayah kekuasaan Admin Super TrukenGo." 
        });
    }
};