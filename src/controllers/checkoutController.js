const productService = require('../services/productService');
const dbService = require('../services/db');

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

        const orderId = `order-${Date.now()}`;
        const orderTotal = parseFloat(total.toFixed(2));

        await dbService.insertOrderHeader({
            order_id: orderId,
            user_id: email,
            total_price: orderTotal
        });

        for (const [productId, item] of Object.entries(cart)) {
            const product = productMap[productId];
            const price = parseFloat(product.price.replace('$', ''));
            const itemTotal = parseFloat((price * item.quantity).toFixed(2));

            await dbService.insertOrderItem({
                order_id: orderId,
                product_id: productId,
                quantity: item.quantity,
                item_price: price,
                total_price: itemTotal
            });
        }

        res.status(200).json({ message: 'Checkout successful!', order_id: orderId });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(400).json({ errors: ['An error occurred during checkout.'] });
    }
};

module.exports = { processCheckout };