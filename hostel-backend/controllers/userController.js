const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { recordActivity } = require('../middleware/auditMiddleware');

// @desc    Get Current User's Recently Accessed Items
// @route   GET /api/user/recently-accessed
// @access  Private
exports.getRecentlyAccessed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recentItems = await ActivityLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recentItems.length,
      items: recentItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Explicitly Record a Recently Accessed Item
// @route   POST /api/user/recently-accessed
// @access  Private
exports.logRecentlyAccessed = async (req, res) => {
  try {
    const { action, resourceType, resourceId, title, route, metadata } = req.body;

    if (!title || !resourceType) {
      return res.status(400).json({
        success: false,
        message: 'Resource title and resourceType are required.',
      });
    }

    const log = await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: action || 'ACCESSED_MODULE',
      resourceType,
      resourceId: resourceId || '',
      title,
      route: route || '/app',
      metadata: metadata || {},
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: 'Recently accessed item logged successfully.',
      log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Multilingual Language Preference
// @route   PATCH /api/user/language
// @access  Private
exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;

    if (!['en', 'ta', 'hi'].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Allowed values: 'en' (English), 'ta' (Tamil), 'hi' (Hindi).",
      });
    }

    const user = await User.findById(req.user._id);
    user.language = language;
    await user.save({ validateBeforeSave: false });

    await recordActivity({
      user,
      action: 'CHANGED_LANGUAGE',
      resourceType: 'profile',
      title: `Language updated to ${language.toUpperCase()}`,
      route: '/app/settings',
    });

    res.status(200).json({
      success: true,
      message: `Preferred language updated to ${language}.`,
      language: user.language,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
