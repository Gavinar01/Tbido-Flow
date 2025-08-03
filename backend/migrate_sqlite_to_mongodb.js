// Migration script to transfer data from SQLite to MongoDB
// This script is optional and only needed if you want to migrate existing data

const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB models
const { User, Venue, Reservation, KeyValueStore } = require('./models');

// SQLite database
const sqliteDb = new sqlite3.Database('./instance/tbido_flow.db', (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/tbido_flow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  migrateData();
});

async function migrateData() {
  try {
    // Migrate users
    await migrateUsers();
    
    // Migrate venues
    await migrateVenues();
    
    // Migrate reservations
    await migrateReservations();
    
    // Migrate key-value store
    await migrateKeyValueStore();
    
    console.log('Data migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

async function migrateUsers() {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM users', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`Migrating ${rows.length} users...`);
      
      for (const row of rows) {
        try {
          // Check if user already exists in MongoDB
          const existingUser = await User.findOne({ email: row.email });
          if (existingUser) {
            console.log(`User ${row.email} already exists, skipping...`);
            continue;
          }
          
          // Create new user in MongoDB
          const user = new User({
            email: row.email,
            password_hash: row.password_hash,
            name: row.name,
            is_admin: row.is_admin,
            created_at: row.created_at
          });
          
          await user.save();
          console.log(`Migrated user: ${row.email}`);
        } catch (error) {
          console.error(`Error migrating user ${row.email}:`, error);
        }
      }
      
      console.log('Users migration completed');
      resolve();
    });
  });
}

async function migrateVenues() {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM venues', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`Migrating ${rows.length} venues...`);
      
      for (const row of rows) {
        try {
          // Check if venue already exists in MongoDB
          const existingVenue = await Venue.findById(row.id);
          if (existingVenue) {
            console.log(`Venue ${row.name} already exists, skipping...`);
            continue;
          }
          
          // Create new venue in MongoDB
          const venue = new Venue({
            _id: row.id,
            name: row.name,
            capacity: row.capacity
          });
          
          await venue.save();
          console.log(`Migrated venue: ${row.name}`);
        } catch (error) {
          console.error(`Error migrating venue ${row.name}:`, error);
        }
      }
      
      console.log('Venues migration completed');
      resolve();
    });
  });
}

async function migrateReservations() {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM reservations', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`Migrating ${rows.length} reservations...`);
      
      for (const row of rows) {
        try {
          // Check if reservation already exists in MongoDB
          const existingReservation = await Reservation.findOne({ 
            user_id: row.user_id,
            date: row.date,
            start_time: row.start_time,
            end_time: row.end_time
          });
          
          if (existingReservation) {
            console.log(`Reservation for ${row.date} already exists, skipping...`);
            continue;
          }
          
          // Create new reservation in MongoDB
          const reservation = new Reservation({
            user_id: row.user_id,
            venue: row.venue,
            purpose: row.purpose,
            date: row.date,
            start_time: row.start_time,
            end_time: row.end_time,
            name: row.name,
            organization: row.organization,
            max_participants: row.max_participants,
            status: row.status,
            created_at: row.created_at
          });
          
          await reservation.save();
          console.log(`Migrated reservation: ${row.purpose} on ${row.date}`);
        } catch (error) {
          console.error(`Error migrating reservation:`, error);
        }
      }
      
      console.log('Reservations migration completed');
      resolve();
    });
  });
}

async function migrateKeyValueStore() {
  return new Promise((resolve, reject) => {
    sqliteDb.all('SELECT * FROM kv_store_1bbfbc2f', async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`Migrating ${rows.length} key-value pairs...`);
      
      for (const row of rows) {
        try {
          // Check if key already exists in MongoDB
          const existingKV = await KeyValueStore.findOne({ key: row.key });
          if (existingKV) {
            console.log(`Key ${row.key} already exists, skipping...`);
            continue;
          }
          
          // Create new key-value pair in MongoDB
          const kv = new KeyValueStore({
            key: row.key,
            value: row.value
          });
          
          await kv.save();
          console.log(`Migrated key-value pair: ${row.key}`);
        } catch (error) {
          console.error(`Error migrating key-value pair ${row.key}:`, error);
        }
      }
      
      console.log('Key-value store migration completed');
      resolve();
    });
  });
}
