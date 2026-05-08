const dbService = require('./db');

const getAllProducts = async () => {
    try {
        const products = await dbService.getAllProducts();
        return products;
    } catch (error) {
        throw new Error('Error reading product data from database');
    }
};

const saveProducts = async (products) => {
    try {
        await dbService.updateProducts(products);
    } catch (error) {
        throw new Error('Error saving product data to database');
    }
};

module.exports = { getAllProducts, saveProducts };