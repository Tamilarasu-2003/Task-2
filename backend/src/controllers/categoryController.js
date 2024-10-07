const Category = require('../models/Category');

const categoryController = {
    getCategories: async (req, res) => {
        try {
            const result = await Category.findAll();
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
};

module.exports = categoryController;
