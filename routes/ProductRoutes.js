const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');

router.get('/:productId', productController.getProductById);
router.post('/:productId', productController.updatePrice);
router.put('/:productId', productController.updatePrice);

module.exports = router;