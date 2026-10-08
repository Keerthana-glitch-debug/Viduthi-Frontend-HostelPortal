const express = require('express');
const router = express.Router();
const { getVisitors, registerVisitor, checkoutVisitor, updateVisitorStatus } = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', authorize('warden', 'admin', 'staff'), getVisitors);
router.post('/', authorize('warden', 'admin', 'staff'), registerVisitor);
router.patch('/:id/status', authorize('warden', 'admin'), updateVisitorStatus);
router.patch('/:id/checkout', authorize('warden', 'admin', 'staff'), checkoutVisitor);

module.exports = router;
