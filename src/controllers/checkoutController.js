const productService = require('../services/productService');
const dbService = require('../services/db');

const processCheckout = async (req, res) => {
    try {
        // SECURITY FIX #1: IDOR - Use authenticated user ID, not from request body
        // req.user comes from JWT token (authenticateToken middleware)
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401).json({ errors: ['User authentication required'] });
        }

        const { cart, paymentToken } = req.body;

        // SECURITY FIX #3: Parameter Tampering - Validate cart structure
        if (!cart || typeof cart !== 'object' || Object.keys(cart).length === 0) {
            return res.status(400).json({ errors: ['Cart cannot be empty'] });
        }

        // Validate cart items
        const products = await productService.getAllProducts();
        const productMap = {};
        products.forEach(p => productMap[p.id] = p);

        let errors = [];
        let total = 0;

        for (const [id, item] of Object.entries(cart)) {
            // Validate product ID format
            if (!id || id.toString().length > 50) {
                errors.push('Invalid product ID format');
                continue;
            }

            // Validate item quantity
            const quantity = parseInt(item.quantity, 10);
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
                errors.push(`Invalid quantity for product ${id}. Must be integer between 1 and 10000`);
                continue;
            }

            const product = productMap[id];
            if (!product) {
                errors.push(`Product ${id} does not exist.`);
                continue;
            }
            if (quantity > product.quantity) {
                errors.push(`Insufficient stock for ${product.title}. Available: ${product.quantity}, Requested: ${quantity}.`);
            }
            const price = parseFloat(product.price.replace('$', ''));
            if (isNaN(price) || price < 0) {
                errors.push(`Invalid price for ${product.title}`);
                continue;
            }
            total += price * quantity;
        }

        // SECURITY FIX #2: Sensitive Data Exposure - Never store raw card numbers
        // Accept only tokenized payment method
        if (!paymentToken || paymentToken.toString().length > 500) {
            errors.push('Invalid payment token. Use a payment processor like Stripe.');
        }
        
        // ⚠️ NOTE: In production, always use a payment processor (Stripe, Square, PayPal)
        // Never store raw credit card numbers - PCI-DSS violation
        // Token should come from frontend payment form (Stripe.js, etc)

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // ✅ Security: Process payment with tokenized payment method
        // In production: verify paymentToken with Stripe/payment processor
        // const stripeResult = await stripe.charges.create({
        //     amount: Math.round(total * 100),
        //     currency: 'usd',
        //     source: paymentToken,
        //     description: `Order for user ${userId}`
        // });
        // if (!stripeResult.success) return error

        // Update stock
        for (const [id, item] of Object.entries(cart)) {
            const product = productMap[id];
            const quantity = parseInt(item.quantity, 10);
            product.quantity -= quantity;
        }
        await productService.saveProducts(products);

        const orderId = `order-${Date.now()}`;
        const orderTotal = parseFloat(total.toFixed(2));

        // SECURITY FIX #1: Use authenticated userId, not email from request
        await dbService.insertOrderHeader({
            order_id: orderId,
            user_id: userId,
            total_price: orderTotal
        });

        for (const [productId, item] of Object.entries(cart)) {
            const product = productMap[productId];
            const price = parseFloat(product.price.replace('$', ''));
            const quantity = parseInt(item.quantity, 10);
            const itemTotal = parseFloat((price * quantity).toFixed(2));

            await dbService.insertOrderItem({
                order_id: orderId,
                product_id: productId,
                quantity: quantity,
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