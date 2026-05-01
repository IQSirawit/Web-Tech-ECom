const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Define the GET /api/products route
router.get('/', productController.getProducts);

module.exports = router;