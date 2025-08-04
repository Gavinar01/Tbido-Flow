const express = require('express');
const Reservation = require('../models/Reservation');
const Venue = require('../models/Venue');

const router = express.Router();

// Get all reservations (admin) or user's reservations
router.get('/', async (req, res) => {
  try {
    const filter = req.user.isAdmin ? {} : { user: req.user.id };
    const reservations = await Reservation.find(filter)
      .populate('venue', 'name capacity')
      .populate('user', 'name email');
    // Transform reservations to match frontend expectations
    const transformedReservations = reservations.map(reservation => ({
      id: reservation._id.toString(),
      purpose: reservation.purpose,
      venue: reservation.venue._id.toString(),
      date: reservation.date.toISOString().split('T')[0],
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      maxParticipants: reservation.maxParticipants,
      status: reservation.status,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      organization: reservation.organization || '',
      attendance: reservation.attendance || []
    }));
    res.json(transformedReservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('venue', 'name capacity')
      .populate('user', 'name email');
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    // Check if user owns reservation or is admin
    if (!req.user.isAdmin && reservation.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Transform reservation to match frontend expectations
    const transformedReservation = {
      id: reservation._id.toString(),
      purpose: reservation.purpose,
      venue: reservation.venue._id.toString(),
      date: reservation.date.toISOString().split('T')[0],
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      maxParticipants: reservation.maxParticipants,
      status: reservation.status,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      organization: reservation.organization || '',
      attendance: reservation.attendance || []
    };
    
    res.json(transformedReservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create reservation
router.post('/', async (req, res) => {
  try {
    const { venue, purpose, date, startTime, endTime, name, organization, maxParticipants } = req.body;
    
    // Validate venue exists
    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) {
      return res.status(400).json({ error: 'Invalid venue' });
    }
    
    // Check for overlapping reservations
    const overlapping = await Reservation.findOne({
      venue,
      date,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });
    
    if (overlapping) {
      return res.status(400).json({ error: 'Venue is already reserved for this time slot' });
    }
    
    // Create reservation
    const reservation = new Reservation({
      venue,
      user: req.user.id,
      purpose,
      date,
      startTime,
      endTime,
      name,
      organization,
      maxParticipants
    });
    
    await reservation.save();
    
    // Populate venue and user details
    await reservation.populate('venue', 'name capacity');
    await reservation.populate('user', 'name email');
    
    // Transform reservation to match frontend expectations
    const transformedReservation = {
      id: reservation._id.toString(),
      purpose: reservation.purpose,
      venue: reservation.venue._id.toString(),
      date: reservation.date.toISOString().split('T')[0],
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      maxParticipants: reservation.maxParticipants,
      status: reservation.status,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      organization: reservation.organization || '',
      attendance: reservation.attendance || []
    };
    
    res.status(201).json(transformedReservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update reservation attendance (admin or owner)
router.put('/:id/attendance', async (req, res) => {
  try {
    const { attendance } = req.body;
    
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    // Check if user owns reservation or is admin
    if (!req.user.isAdmin && reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    reservation.attendance = attendance;
    await reservation.save();
    
    // Transform reservation to match frontend expectations
    const transformedReservation = {
      id: reservation._id.toString(),
      purpose: reservation.purpose,
      venue: reservation.venue._id.toString(),
      date: reservation.date.toISOString().split('T')[0],
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      maxParticipants: reservation.maxParticipants,
      status: reservation.status,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      organization: reservation.organization || '',
      attendance: reservation.attendance || []
    };
    
    res.json(transformedReservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete reservation (admin or owner)
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    // Check if user owns reservation or is admin
    if (!req.user.isAdmin && reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await reservation.remove();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
