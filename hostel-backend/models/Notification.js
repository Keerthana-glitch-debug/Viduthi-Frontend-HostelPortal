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
      enum: ['announcement', 'maintenance', 'gate', 'alert', 'mess'],
      default: 'announcement',
    },
    audience: {
      type: String,
      enum: ['all', 'students', 'wardens', 'block_a', 'block_b'],
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
