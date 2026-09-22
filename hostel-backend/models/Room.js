const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    block: {
      type: String,
      enum: ['Block A', 'Block B', 'Block C'],
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 2,
    },
    occupancy: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance'],
      default: 'Available',
    },
    type: {
      type: String,
      enum: ['Double Sharing', 'Single AC', 'Triple Deluxe'],
      default: 'Double Sharing',
    },
    amenities: [
      {
        type: String,
      },
    ],
    residents: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        rollNo: String,
        department: String,
        phone: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
