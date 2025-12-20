const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  inTime: {
    type: String, // Format: HH:mm
    default: null
  },
  outTime: {
    type: String, // Format: HH:mm
    default: null
  },
  expectedHours: {
    type: Number,
    required: true,
    default: 0
  },
  workedHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'leave', 'holiday'],
    default: 'present'
  },
  isLeave: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
attendanceSchema.index({ employeeName: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);


