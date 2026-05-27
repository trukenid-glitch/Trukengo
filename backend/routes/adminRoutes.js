const express = require('express');
const router = express.Router();
const { getBaseLocation, updateLocation } = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/authMiddleware');

// Pasang isAdmin di tengah-tengah sebagai filter
router.get('/base-location', isAdmin, getBaseLocation);
router.get('/base-location-open', getBaseLocation);
router.put('/update-location', isAdmin, updateLocation);

module.exports = router;