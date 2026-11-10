const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, c.createOrder).get(protect, admin, c.getAllOrders);
router.get('/mine', protect, c.getMyOrders); // must be before /:id
router.route('/:id').get(protect, c.getOrderById).delete(protect, admin, c.deleteOrder);
router.put('/:id/status', protect, admin, c.updateOrderStatus);
router.put('/:id/cancel', protect, c.cancelOrder);

module.exports = router;
