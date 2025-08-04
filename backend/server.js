const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const reservationRoutes = require('./routes/reservations');

// Import middleware
const { auth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Agile146658:Agile146658@cybernest.9hk32he.mongodb.net/venue_reservation_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Venue Reservation System API' });
});

// Public routes
app.use('/auth', authRoutes);

// Supabase function compatible routes
app.use('/functions/v1/make-server-1bbfbc2f', authRoutes);
app.use('/functions/v1/make-server-1bbfbc2f/venues', auth, venueRoutes);
app.use('/functions/v1/make-server-1bbfbc2f/reservations', auth, reservationRoutes);

// Protected routes
app.use('/venues', auth, venueRoutes);
app.use('/reservations', auth, reservationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
