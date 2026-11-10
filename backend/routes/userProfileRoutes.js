const router = require('express').Router();
const c = require('../controllers/userProfile');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/profile').get(protect, c.getProfile).put(protect, c.updateProfile).delete(protect, c.deleteProfile);

router.get('/', protect, admin, c.getUsers);
router.route('/:id').get(protect, admin, c.getUserById).put(protect, admin, c.updateUser).delete(protect, admin, c.deleteUser);

module.exports = router;
