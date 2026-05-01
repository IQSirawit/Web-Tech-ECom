const express = require('express');
const productRoutes = require('./routes/productRoutes.js');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Use the product routes for any request starting with /api/products
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
    console.log(`Bookly Architect: Server running on http://localhost:${PORT}`);
});

// Add this in app.js BEFORE app.listen
app.get('/', (req, res) => {
    res.send('Welcome to the Bookly API! Go to /api/products to see data.');
});