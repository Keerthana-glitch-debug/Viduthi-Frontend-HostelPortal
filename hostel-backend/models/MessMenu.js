const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
      unique: true,
    },
    breakfast: {
      type: String,
      required: true,
    },
    lunch: {
      type: String,
      required: true,
    },
    snacksWeek1: {
      type: String,
      required: true,
    },
    snacksWeek2: {
      type: String,
      required: true,
    },
    dinner: {
      type: String,
      required: true,
    },
    lunchSpecial: {
      type: String,
      default: '',
    },
    dietType: {
      type: String,
      default: 'South Indian Veg / Non-Veg Optional',
    },
    updatedBy: {
      type: String,
      default: 'Mrs. Muthumari (Mess Supervisor)',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MessMenu', messMenuSchema);
