const ActivityLog = require('../models/ActivityLog');

/**
 * Utility to asynchronously record an audit / recently-accessed trail item
 */
const recordActivity = async ({ user, action, resourceType, resourceId, title, route, metadata, ipAddress }) => {
  try {
    if (!user) return;
    await ActivityLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: action || 'ACCESSED_RESOURCE',
      resourceType,
      resourceId: resourceId || '',
      title,
      route: route || '/app',
      metadata: metadata || {},
      ipAddress: ipAddress || '127.0.0.1',
    });
  } catch (err) {
    // Audit logging should not crash the primary operational request
    console.error('[Audit Logger] Error saving activity:', err.message);
  }
};

module.exports = { recordActivity };
