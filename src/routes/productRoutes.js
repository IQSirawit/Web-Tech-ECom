const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// This handles GET /api/products and accepts query parameters like /api/products?category=Sci-fi
router.get('/', productController.getProducts);

module.exports = router;