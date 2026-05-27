const express = require("express");
const router = express.Router();
const { userLogin } = require("../controllers/authController");

// Endpoint: POST /api/auth/login
router.post("/login", userLogin);

module.exports = router;
