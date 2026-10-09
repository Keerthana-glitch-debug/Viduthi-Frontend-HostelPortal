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
      default: 'announcement',
    },
    audience: {
      type: String,
      default: 'all',
    },
    target: {
      type: String,
      default: 'All Residents',
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
