const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.setPassword = async function(password) {
  this.password_hash = await bcrypt.hash(password, 10);
};

userSchema.methods.checkPassword = async function(password) {
  return bcrypt.compare(password, this.password_hash);
};

// Venue Schema
const venueSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  }
});

// Reservation Schema
const reservationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  venue: {
    type: String,
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
  start_time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    default: ''
  },
  max_participants: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'confirmed'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// KeyValueStore Schema
const keyValueStoreSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

// Models
const User = mongoose.model('User', userSchema);
const Venue = mongoose.model('Venue', venueSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const KeyValueStore = mongoose.model('KeyValueStore', keyValueStoreSchema);

module.exports = {
  User,
  Venue,
  Reservation,
  KeyValueStore
};
