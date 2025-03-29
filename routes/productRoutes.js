// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { isAuth } = require('../middlewares/authMiddleware');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getActiveProducts
} = require('../controllers/productController');

router.post('/', isAuth, createProduct);
router.get('/', getProducts);
router.get('/active', getActiveProducts);
router.get('/:id', getProductById);
router.put('/:id', isAuth, updateProduct);
router.delete('/:id', isAuth, deleteProduct);

module.exports = router;
