const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['announcement', 'maintenance', 'gate', 'alert', 'mess', 'emergency_sos'],
      default: 'announcement',
    },
    audience: {
      type: String,
      enum: ['all', 'students', 'wardens', 'block_a', 'block_b', 'security'],
      default: 'all',
    },
    author: {
      type: String,
      default: 'Warden Office',
    },
    read: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    alertId: {
      type: String,
    },
    location: {
      type: String,
    },
    residentName: {
      type: String,
    },
    residentRoll: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active',
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
