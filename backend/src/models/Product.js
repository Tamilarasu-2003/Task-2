const { productPool } = require('../config/db');

const Product = {
    findAll: async (category, limit, offset) => {
        let query = 'SELECT * FROM products';
        const queryParams = [];
        if (category) {
            query += ' WHERE category = $1::text';
            queryParams.push(category);
        }
        query += ' LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
        queryParams.push(limit, offset);
        return await productPool.query(query, queryParams);
    },
    count: async (category) => {
        return await productPool.query('SELECT COUNT(*) FROM products' + (category ? ' WHERE category = $1::text' : ''), category ? [category] : []);
    },
    search: async (query) => {
        const searchQuery = `%${query}%`; // Use wildcards for searching
        const sql = 'SELECT * FROM products WHERE name ILIKE $1';
        return await productPool.query(sql, [searchQuery]);
    }
};

module.exports = Product;
