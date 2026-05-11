require('dotenv').config();

// Import configuration and validate environment
const { config, validateConfig } = require('./config');

try {
    validateConfig();
} catch (error) {
    console.error('Configuration Error:', error.message);
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const productRoutes = require('./routes/productRoutes.js');
const authRoutes = require('./routes/authRoutes'); // Imported here
const checkoutRoutes = require('./routes/checkoutRoutes');
const db = require('./services/db');

const app = express();
// Audit Task: Explicitly use process.env.PORT
const PORT = process.env.PORT || config.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// CORS
app.use(cors({
    origin: config.ALLOWED_ORIGINS,
    credentials: true,
}));

// Middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// 1. Register the Auth Routes
// This ensures that any request starting with /api/auth is handled by authRoutes.js
app.use('/api/auth', authRoutes); 

// 2. Use the product routes
app.use('/api/products', productRoutes);

// 3. Use the checkout routes
app.use('/api/checkout', checkoutRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Bookly API! Go to /api/products to see data.');
});

// 4. Global Error Handling Middleware (UX vs Dev)
app.use((err, req, res, next) => {
    // Dev sees detailed log
    console.error(`[ERROR] ${err.name}: ${err.message}\n${err.stack}`);
    
    // User sees friendly message
    res.status(500).json({ 
        errors: ['Oops, something went wrong. Please try again later.'] 
    });
});

app.listen(PORT, () => {
    console.log(`Bookly Architect: Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit process in production, just log
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});