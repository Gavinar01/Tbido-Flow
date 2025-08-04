const mongoose = require('mongoose');
const Venue = require('./models/Venue');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Default venues
const defaultVenues = [
  { name: 'Conference Room A', capacity: 20 },
  { name: 'Conference Room B', capacity: 15 },
  { name: 'Meeting Room 1', capacity: 8 },
  { name: 'Meeting Room 2', capacity: 6 },
  { name: 'Main Hall', capacity: 20 }
];

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Agile146658:Agile146658@cybernest.9hk32he.mongodb.net/venue_reservation_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Check if venues already exist
  const existingVenues = await Venue.find({});
  if (existingVenues.length > 0) {
    console.log('Venues already exist in the database. Skipping seeding.');
    process.exit(0);
  }
  
  // Insert default venues
  try {
    await Venue.insertMany(defaultVenues);
    console.log('Default venues seeded successfully');
  } catch (error) {
    console.error('Error seeding venues:', error);
  }
  
  process.exit(0);
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});
