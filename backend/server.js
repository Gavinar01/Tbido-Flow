const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "https://www.figma.com"],
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tbido_flow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Import models
const { User, Venue, Reservation, KeyValueStore } = require('./models');

// Default venues
const DEFAULT_VENUES = [
  { _id: '1', name: 'Conference Room A', capacity: 20 },
  { _id: '2', name: 'Conference Room B', capacity: 15 },
  { _id: '3', name: 'Meeting Room 1', capacity: 8 },
  { _id: '4', name: 'Meeting Room 2', capacity: 6 },
  { _id: '5', name: 'Main Hall', capacity: 20 }
];

// Initialize default venues
const initializeVenues = async () => {
  try {
    for (const venueData of DEFAULT_VENUES) {
      const existingVenue = await Venue.findById(venueData._id);
      if (!existingVenue) {
        const venue = new Venue(venueData);
        await venue.save();
        console.log(`Created venue: ${venue.name}`);
      }
    }
  } catch (error) {
    console.error('Error initializing venues:', error);
  }
};

// JWT verification middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY || 'tbido-flow-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/make-server-1bbfbc2f/signup', async (req, res) => {
  try {
    const { email, password, name, isAdmin } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      name: name || '',
      is_admin: isAdmin || false
    });

    await user.setPassword(password);
    await user.save();

    // Create access token
    const access_token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET_KEY || 'tbido-flow-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        user_metadata: {
          name: user.name,
          isAdmin: user.is_admin
        }
      },
      access_token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/make-server-1bbfbc2f/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const access_token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET_KEY || 'tbido-flow-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        user_metadata: {
          name: user.name,
          isAdmin: user.is_admin
        }
      },
      access_token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/make-server-1bbfbc2f/venues', async (req, res) => {
  try {
    const venues = await Venue.find({});
    const venuesData = venues.map(venue => ({
      id: venue._id,
      name: venue.name,
      capacity: venue.capacity
    }));

    // Store in key-value store to match original behavior
    await KeyValueStore.findOneAndUpdate(
      { key: 'venues' },
      { key: 'venues', value: venuesData },
      { upsert: true, new: true }
    );

    res.status(200).json(venuesData);

  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});

app.post('/make-server-1bbfbc2f/reservations', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      venue,
      purpose,
      date,
      startTime,
      endTime,
      name,
      organization,
      maxParticipants
    } = req.body;

    // Validate time range (8 AM to 5 PM)
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);

    if (startHour < 8 || endHour > 17 || startHour >= endHour) {
      return res.status(400).json({
        error: 'Invalid time range. Reservations must be between 8:00 AM and 5:00 PM.'
      });
    }

    if (maxParticipants > 20) {
      return res.status(400).json({
        error: 'Maximum participants cannot exceed 20 people.'
      });
    }

    // Check for conflicts
    const existingReservations = await Reservation.find({
      venue,
      date
    });

    for (const reservation of existingReservations) {
      // Check time conflicts
      if ((startTime >= reservation.start_time && startTime < reservation.end_time) ||
          (endTime > reservation.start_time && endTime <= reservation.end_time) ||
          (startTime <= reservation.start_time && endTime >= reservation.end_time)) {
        return res.status(400).json({
          error: 'Time slot conflicts with existing reservation'
        });
      }
    }

    // Create reservation
    const reservation = new Reservation({
      user_id: req.user.sub,
      venue,
      purpose,
      date,
      start_time: startTime,
      end_time: endTime,
      name,
      organization: organization || '',
      max_participants: maxParticipants || 0,
      status: 'confirmed'
    });

    await reservation.save();

    // Add to key-value store
    const reservationData = {
      id: reservation._id,
      userId: reservation.user_id,
      userEmail: user.email,
      userName: user.name,
      venue: reservation.venue,
      purpose: reservation.purpose,
      date: reservation.date,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
      name: reservation.name,
      organization: reservation.organization,
      maxParticipants: reservation.max_participants,
      status: reservation.status,
      createdAt: reservation.created_at.toISOString()
    };

    const reservationsKV = await KeyValueStore.findOne({ key: 'reservations' });
    let reservationsList = [];

    if (reservationsKV) {
      reservationsList = Array.isArray(reservationsKV.value) ? reservationsKV.value : [];
      reservationsList.push(reservationData);
      reservationsKV.value = reservationsList;
      await reservationsKV.save();
    } else {
      reservationsList.push(reservationData);
      await KeyValueStore.create({ key: 'reservations', value: reservationsList });
    }

    // Mock email notification
    console.log(`Email notification sent to ${user.email}: Venue reservation confirmed for ${reservation.date} from ${reservation.start_time} to ${reservation.end_time}`);

    res.status(200).json({ reservation: reservationData });

  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

app.get('/make-server-1bbfbc2f/reservations', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get from key-value store
    const reservationsKV = await KeyValueStore.findOne({ key: 'reservations' });
    const reservationsList = reservationsKV && Array.isArray(reservationsKV.value) ? reservationsKV.value : [];

    // If admin, return all reservations, otherwise only user's reservations
    const filteredReservations = user.is_admin
      ? reservationsList
      : reservationsList.filter(r => r.userId.toString() === req.user.sub.toString());

    res.status(200).json(filteredReservations);

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

app.put('/make-server-1bbfbc2f/reservations/:reservationId/attendance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user || !user.is_admin) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    const { attendance = [] } = req.body;
    const { reservationId } = req.params;

    // Update in key-value store
    const reservationsKV = await KeyValueStore.findOne({ key: 'reservations' });
    if (reservationsKV && Array.isArray(reservationsKV.value)) {
      const reservationsList = reservationsKV.value;
      
      for (let i = 0; i < reservationsList.length; i++) {
        if (reservationsList[i].id.toString() === reservationId.toString()) {
          reservationsList[i].attendance = attendance;
          break;
        }
      }
      
      reservationsKV.value = reservationsList;
      await reservationsKV.save();
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

app.delete('/make-server-1bbfbc2f/reservations/:reservationId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reservationId } = req.params;

    // Update in key-value store
    const reservationsKV = await KeyValueStore.findOne({ key: 'reservations' });
    if (reservationsKV && Array.isArray(reservationsKV.value)) {
      const reservationsList = reservationsKV.value;
      
      let reservationToDelete = null;
      let deleteIndex = -1;
      
      for (let i = 0; i < reservationsList.length; i++) {
        if (reservationsList[i].id.toString() === reservationId.toString()) {
          reservationToDelete = reservationsList[i];
          deleteIndex = i;
          break;
        }
      }
      
      if (!reservationToDelete) {
        return res.status(404).json({ error: 'Reservation not found' });
      }
      
      // Allow deletion by reservation owner or admin
      if (reservationToDelete.userId.toString() !== req.user.sub.toString() && !user.is_admin) {
        return res.status(403).json({ error: 'Unauthorized to delete this reservation' });
      }
      
      reservationsList.splice(deleteIndex, 1);
      reservationsKV.value = reservationsList;
      await reservationsKV.save();
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Express server running on port ${PORT}`);
  await initializeVenues();
});
