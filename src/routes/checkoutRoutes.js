const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// SECURITY: Strict rate limiting on checkout endpoint
// Prevents abuse (price manipulation attempts, brute force attacks, DoS)
// Max 5 checkout attempts per IP per 15 minutes
const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 requests
    message: 'Too many checkout attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for GET requests (not applicable here)
        return req.method !== 'POST';
    }
});

router.post('/', authenticateToken, checkoutLimiter, checkoutController.processCheckout);

module.exports = router;