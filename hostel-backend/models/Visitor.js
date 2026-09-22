const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    passNumber: {
      type: String,
      required: true,
      unique: true,
    },
    visitorName: {
      type: String,
      required: true,
    },
    visitorPhone: {
      type: String,
      required: true,
    },
    relation: {
      type: String,
      required: true,
    },
    hostStudentRoll: {
      type: String,
      required: true,
    },
    hostStudentName: {
      type: String,
      required: true,
    },
    hostRoom: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    idProofType: {
      type: String,
      enum: ['Aadhaar', 'Driver License', 'Voter ID', 'Passport'],
      default: 'Aadhaar',
    },
    idProofNumber: {
      type: String,
      required: true,
    },
    entryTime: {
      type: Date,
      default: Date.now,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active Inside', 'Checked Out', 'Overstayed Alert'],
      default: 'Active Inside',
    },
    gateOfficer: {
      type: String,
      default: 'Gate Post 1 - Main North Entrance',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Visitor', visitorSchema);
