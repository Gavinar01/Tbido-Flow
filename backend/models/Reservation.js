const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  organization: {
    type: String
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  attendance: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient querying
reservationSchema.index({ date: 1, venue: 1 });
reservationSchema.index({ user: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
