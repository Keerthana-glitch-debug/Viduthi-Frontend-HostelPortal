const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide equipment name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['sports', 'gym'],
      required: true,
      default: 'sports',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    totalStock: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    location: {
      type: String,
      default: 'Hostel Sports & Gym Center',
      trim: true,
    },
    specs: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Optimal', 'Maintenance', 'Restocking'],
      default: 'Optimal',
    },
    maxBorrowHours: {
      type: Number,
      default: 3,
    },
    condition: {
      type: String,
      default: 'Good',
    },
    updatedBy: {
      type: String,
      default: 'Jeyanthi (Warden)',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
