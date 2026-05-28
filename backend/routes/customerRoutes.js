const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerControllers');

router.get('/stores', customerController.getStores);
router.get('/stores/:id', customerController.getStoreDetail);

module.exports = router;