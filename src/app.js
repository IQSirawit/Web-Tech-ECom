const express = require('express');
const cors = require('cors'); 
const productRoutes = require('./routes/productRoutes.js');
const authRoutes = require('./routes/authRoutes'); // Imported here

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); 
app.use(express.json());

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// 1. Register the Auth Routes
// This ensures that any request starting with /api/auth is handled by authRoutes.js
app.use('/api/auth', authRoutes); 

// 2. Use the product routes
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Bookly API! Go to /api/products to see data.');
});

app.listen(PORT, () => {
    console.log(`Bookly Architect: Server running on http://localhost:${PORT}`);
});