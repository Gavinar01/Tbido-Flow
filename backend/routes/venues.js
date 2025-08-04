const express = require('express');
const Venue = require('../models/Venue');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all venues
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true });
    // Transform venues to match frontend expectations
    const transformedVenues = venues.map(venue => ({
      id: venue._id.toString(),
      name: venue.name,
      capacity: venue.capacity
    }));
    res.json(transformedVenues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get venue by ID
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create venue (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const venue = new Venue(req.body);
    await venue.save();
    res.status(201).json(venue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update venue (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json(venue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete venue (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
