const fs = require('fs').promises;
const path = require('path');

// Path to your local JSON file
const dataPath = path.join(__dirname, '../../data/products.json');

const getAllProducts = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        const parsedData = JSON.parse(data);
        return parsedData.products; // Returns the products array
    } catch (error) {
        throw new Error('Error reading product data');
    }
};

const saveProducts = async (products) => {
    try {
        const data = { products };
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
        throw new Error('Error saving product data');
    }
};

module.exports = { getAllProducts, saveProducts };