const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        // REQUEST: Extract the 'category' from the query parameters (?category=...)
        const { category, page = 1, limit = 20 } = req.query;

        // SECURITY FIX #4: Numeric Input Validation - Stricter validation
        // Validate and sanitize pagination parameters
        let pageNum = parseInt(page, 10);
        let limitNum = parseInt(limit, 10);

        // Check for valid integers
        if (!Number.isInteger(pageNum) || !Number.isInteger(limitNum)) {
            return res.status(400).json({ message: 'Page and limit must be valid integers' });
        }

        // Enforce reasonable ranges
        if (pageNum < 1) pageNum = 1;
        if (limitNum < 1 || limitNum > 100) {
            limitNum = 20; // Default to 20
        }

        // Validate category parameter (prevent injection)
        if (category && (category.length > 100 || typeof category !== 'string')) {
            return res.status(400).json({ message: 'Invalid category parameter' });
        }

        // PROCESSING: Fetch paginated products from the service
        const result = await productService.getAllProductsPaginated(category, pageNum, limitNum);

        // RESPONSE: Send back the paginated results
        res.status(200).json({
            products: result.products,
            pagination: {
                currentPage: pageNum,
                totalPages: result.totalPages,
                totalProducts: result.totalProducts,
                hasNext: pageNum < result.totalPages,
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Product fetch error:', error);
        // RESPONSE: Send a 500 status if there is a server-side error
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getProducts };