const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markRead,
  markAllRead,
  triggerSosAlert,
  getActiveSosAlerts,
  resolveSosAlert,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getNotifications);
router.post('/', protect, createNotification);
router.patch('/:id', protect, markRead);
router.patch('/', protect, markAllRead);

// Real-Time Emergency SOS routes
router.get('/sos', getActiveSosAlerts);
router.post('/sos', protect, triggerSosAlert);
router.patch('/sos/:id/resolve', protect, authorize('warden', 'admin', 'staff'), resolveSosAlert);

module.exports = router;
