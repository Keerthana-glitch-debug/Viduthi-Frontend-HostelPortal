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

// @desc    Broadcast Emergency SOS Distress Signal
// @route   POST /api/notifications/sos
// @access  Private / Authenticated
exports.triggerSosAlert = async (req, res) => {
  try {
    const { roomNumber, block, emergencyType, residentName, residentRoll } = req.body;
    const alertId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
    const studentName = residentName || req.user?.name || 'Resident';
    const roll = residentRoll || req.user?.rollNo || 'Hostel Resident';
    const loc = roomNumber ? `Room ${roomNumber} (${block || 'Main Block'})` : 'Campus Residential Block';

    const alert = await Notification.create({
      title: `🚨 EMERGENCY SOS: ${studentName} (${roll})`,
      message: `Distress alert triggered for ${loc}. Reason/Category: ${emergencyType || 'Immediate Assistance'}. Campus Security & Wardens alerted.`,
      type: 'emergency_sos',
      audience: 'all',
      author: `${studentName} (${roll})`,
      pinned: true,
      alertId,
      location: loc,
      residentName: studentName,
      residentRoll: roll,
      status: 'Active',
    });

    const { recordActivity } = require('../middleware/auditMiddleware');
    await recordActivity({
      user: req.user,
      action: 'EMERGENCY_SOS_DISPATCH',
      resourceType: 'system',
      resourceId: alert._id.toString(),
      title: `Emergency Distress Broadcasted: ${alertId} (${loc})`,
      route: '/sos',
    });

    res.status(201).json({
      success: true,
      message: `Emergency SOS broadcasted successfully. Alert #${alertId} active across system.`,
      alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Active Emergency SOS Distress Signals
// @route   GET /api/notifications/sos
// @access  Private / Authenticated
exports.getActiveSosAlerts = async (req, res) => {
  try {
    const alerts = await Notification.find({ type: 'emergency_sos' })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resolve Emergency SOS Distress Signal
// @route   PATCH /api/notifications/sos/:id/resolve
// @access  Private (Warden, Admin, Staff)
exports.resolveSosAlert = async (req, res) => {
  try {
    const alert = await Notification.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Emergency alert record not found.' });
    }

    alert.status = 'Resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user ? req.user.name : 'Warden Desk';
    alert.pinned = false;
    await alert.save();

    res.status(200).json({
      success: true,
      message: `Emergency alert ${alert.alertId || alert._id} marked as Resolved.`,
      alert,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

