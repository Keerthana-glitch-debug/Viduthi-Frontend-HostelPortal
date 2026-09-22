const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentRoll: {
      type: String,
      required: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    time: {
      type: String,
      required: true, // HH:MM:SS
    },
    status: {
      type: String,
      enum: ['Present', 'Unverified', 'On Approved Leave', 'Absent'],
      default: 'Present',
    },
    verificationType: {
      type: String,
      enum: ['GPS + Biometric', 'Warden Override', 'Turnstile Gate Sensor'],
      default: 'GPS + Biometric',
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      accuracy: { type: Number, default: 5 }, // In meters
    },
    distanceFromGateMeters: {
      type: Number,
      required: true,
    },
    isInsideGeofence: {
      type: Boolean,
      required: true,
    },
    biometricVerified: {
      type: Boolean,
      default: true,
    },
    auditHash: {
      type: String,
      required: true, // Cryptographic SHA-256 HMAC for anti-spoofing verification
    },
    verifiedByWarden: {
      type: Boolean,
      default: false,
    },
    wardenNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee only one check-in per student per date
attendanceSchema.index({ studentRoll: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
