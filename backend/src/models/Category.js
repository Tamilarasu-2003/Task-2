const { productPool } = require('../config/db');

const Category = {
    findAll: async () => {
        return await productPool.query('SELECT * FROM category');
    }
};

module.exports = Category;
