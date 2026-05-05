const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Standard POST route for login
router.post('/login', authController.login);

// POST route for registration
router.post('/register', authController.register);

module.exports = router;