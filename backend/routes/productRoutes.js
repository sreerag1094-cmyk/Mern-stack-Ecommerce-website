const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', c.getCategories); // must be before /:id
router.route('/').get(c.getProducts).post(protect, admin, c.createProduct);
router
  .route('/:id')
  .get(c.getProductById)
  .put(protect, admin, c.updateProduct)
  .delete(protect, admin, c.deleteProduct);

module.exports = router;
