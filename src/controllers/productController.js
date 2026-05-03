const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        // REQUEST: Extract the 'category' from the query parameters (?category=...)
        const { category } = req.query;

        // PROCESSING: Fetch all products from the service
        let products = await productService.getAllProducts();

        // PROCESSING: If a category was provided, filter the package
        if (category) {
            products = products.filter(p =>
                p.category.toLowerCase() === category.toLowerCase()
            );
        }

        // RESPONSE: Send back the package with a 200 Success status
        if (products.length > 0) {
            res.status(200).json(products);
        } else {
            // RESPONSE: Send a 404 if no products match the specific category
            res.status(404).json({ message: "No products found in this category" });
        }

    } catch (error) {
        // RESPONSE: Send a 500 status if there is a server-side error
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getProducts };