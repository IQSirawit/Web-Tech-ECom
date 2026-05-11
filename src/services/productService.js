const dbService = require('./db');

const getAllProducts = async () => {
    try {
        const products = await dbService.getAllProducts();
        return products;
    } catch (error) {
        throw new Error('Error reading product data from database');
    }
};

const getAllProductsPaginated = async (category, page, limit) => {
    try {
        const offset = (page - 1) * limit;
        const products = await dbService.getAllProductsPaginated(category, limit, offset);
        const totalProducts = await dbService.getProductCount(category);
        const totalPages = Math.ceil(totalProducts / limit);

        return {
            products,
            totalProducts,
            totalPages
        };
    } catch (error) {
        throw new Error('Error reading paginated product data from database');
    }
};

const saveProducts = async (products) => {
    try {
        await dbService.updateProducts(products);
    } catch (error) {
        throw new Error('Error saving product data to database');
    }
};

module.exports = { getAllProducts, getAllProductsPaginated, saveProducts };