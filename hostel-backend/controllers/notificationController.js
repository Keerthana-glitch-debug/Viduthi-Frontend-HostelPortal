const Notification = require('../models/Notification');

// @desc    Get All Notifications
// @route   GET /api/notifications
// @access  Public / Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ pinned: -1, createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Broadcast Notification
// @route   POST /api/notifications
// @access  Private (Warden, Admin)
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, audience, pinned } = req.body;
    const author = req.user ? req.user.name : 'Warden Office';

    const notification = await Notification.create({
      title,
      message,
      type: type || 'announcement',
      audience: audience || 'all',
      author,
      pinned: Boolean(pinned),
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Notification as Read
// @route   PATCH /api/notifications/:id
// @access  Private
exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark All Notifications Read
// @route   PATCH /api/notifications
// @access  Private
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
