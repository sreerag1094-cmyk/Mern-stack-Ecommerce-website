const router = require('express').Router();
const c = require('../controllers/analyticsController');
const { protect, optionalAuth, admin } = require('../middleware/authMiddleware');

// Public / personalised
router.get('/recommendations', optionalAuth, c.recommendForUser);
router.get('/recommendations/product/:id', c.recommendForProduct);

// Admin: RapidMiner data exchange
router.get('/export', protect, admin, c.exportTransactions);
router.post('/import-rules', protect, admin, c.importRules);
router.post('/rebuild', protect, admin, c.rebuildFallback);
router.get('/summary', protect, admin, c.summary);

module.exports = router;
