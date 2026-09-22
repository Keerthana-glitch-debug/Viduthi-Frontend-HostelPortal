const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getNotifications);
router.post('/', protect, createNotification);
router.patch('/:id', protect, markRead);
router.patch('/', protect, markAllRead);

module.exports = router;
