const express = require('express');
const cors = require('cors'); // 1. Import CORS
const productRoutes = require('./routes/productRoutes.js');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // 2. Enable CORS for all routes
app.use(express.json());

// Use the product routes
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Bookly API! Go to /api/products to see data.');
});

app.listen(PORT, () => {
    console.log(`Bookly Architect: Server running on http://localhost:${PORT}`);
});