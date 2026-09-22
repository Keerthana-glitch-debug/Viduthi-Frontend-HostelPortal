const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., 'ACCESSED_MODULE', 'VIEWED_ROOM', 'SUBMITTED_TICKET'
    },
    resourceType: {
      type: String,
      enum: ['room', 'leave', 'complaint', 'attendance', 'simulation', 'admin', 'profile', 'mess', 'laundry', 'system'],
      required: true,
    },
    resourceId: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: true, // e.g. "Room A-101 Allocation", "Outpass Request #LP-9021"
    },
    route: {
      type: String,
      default: '/app',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
