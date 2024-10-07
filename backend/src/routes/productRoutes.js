const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts); // Add this line

module.exports = router;
