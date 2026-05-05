const productService = require('../services/productService');
const fs = require('fs');
const path = require('path');

const processCheckout = async (req, res) => {
    try {
        const { cart, email, card } = req.body;

        // Validate cart items
        const products = await productService.getAllProducts();
        const productMap = {};
        products.forEach(p => productMap[p.id] = p);

        let errors = [];
        let total = 0;

        for (const [id, item] of Object.entries(cart)) {
            const product = productMap[id];
            if (!product) {
                errors.push(`Product ${id} does not exist.`);
                continue;
            }
            if (item.quantity > product.quantity) {
                errors.push(`Insufficient stock for ${product.title}. Available: ${product.quantity}, Requested: ${item.quantity}.`);
            }
            const price = parseFloat(product.price.replace('$', ''));
            total += price * item.quantity;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format.');
        }

        // Validate card
        const cardRegex = /^\d{16}$/;
        if (!cardRegex.test(card)) {
            errors.push('Credit card must be exactly 16 digits.');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Update stock
        for (const [id, item] of Object.entries(cart)) {
            const product = productMap[id];
            product.quantity -= item.quantity;
        }
        await productService.saveProducts(products);

        // Save order
        const orderData = {
            id: Date.now(),
            email,
            card: card.slice(-4), // Store only last 4 digits
            items: cart,
            total: total.toFixed(2),
            date: new Date().toISOString()
        };

        const orderPath = path.join(__dirname, '../../data/order.json');
        let orders = [];
        if (fs.existsSync(orderPath)) {
            try {
                const content = fs.readFileSync(orderPath, 'utf8');
                // Guard against empty file — JSON.parse("") throws SyntaxError
                orders = content.trim() ? JSON.parse(content) : [];
            } catch (parseError) {
                console.warn('order.json was unreadable, starting fresh:', parseError.message);
                orders = [];
            }
        }
        orders.push(orderData);
        fs.writeFileSync(orderPath, JSON.stringify(orders, null, 2));

        res.status(200).json({ message: 'Checkout successful!' });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(400).json({ errors: ['An error occurred during checkout.'] });
    }
};

module.exports = { processCheckout };