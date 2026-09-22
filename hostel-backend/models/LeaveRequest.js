const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    passId: {
      type: String,
      required: true,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentRoll: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Day Pass', 'Weekend Outpass', 'Emergency Medical Leave', 'Vacation Leave'],
      default: 'Day Pass',
    },
    destination: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    parentContact: {
      type: String,
      required: true,
    },
    departureDate: {
      type: String,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    expectedReturnDate: {
      type: String,
      required: true,
    },
    expectedReturnTime: {
      type: String,
      required: true,
    },
    actualReturnTime: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Curfew Violation'],
      default: 'Pending',
    },
    approvedBy: {
      type: String,
      default: null,
    },
    isCurfewCompliant: {
      type: Boolean,
      default: true,
    },
    turnstileQrToken: {
      type: String, // Cryptographic HMAC token readable by turnstiles
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
