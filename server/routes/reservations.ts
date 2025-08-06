import { RequestHandler } from 'express';
import { Reservation } from '../models/Reservation';
import { User } from '../models/User';
import { connectToDatabase } from '../lib/database';
import { AuthRequest } from '../lib/auth';

export const createReservation: RequestHandler = async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
    
    const {
      venue,
      purpose,
      date,
      startTime,
      endTime,
      participantCount,
      organizerName,
      organizerOrganization
    } = req.body;

    // Validate required fields
    if (!venue || !purpose || !date || !startTime || !endTime || !participantCount || !organizerName) {
      return res.status(400).json({ 
        error: 'All reservation details are required' 
      });
    }

    // Validate participant count
    if (participantCount < 1 || participantCount > 20) {
      return res.status(400).json({ 
        error: 'Participant count must be between 1 and 20' 
      });
    }

    // Check for conflicting reservations
    const conflictingReservation = await Reservation.findOne({
      venue,
      date: new Date(date),
      status: 'confirmed',
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingReservation) {
      return res.status(409).json({ 
        error: 'This time slot is already booked for the selected venue' 
      });
    }

    // Create reservation
    const reservation = new Reservation({
      userId: req.user!.id,
      venue,
      purpose,
      date: new Date(date),
      startTime,
      endTime,
      participantCount,
      organizerName,
      organizerOrganization,
      status: 'confirmed'
    });

    await reservation.save();

    // Populate user info for response
    await reservation.populate('userId', 'firstName lastName email organization');

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserReservations: RequestHandler = async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
    
    const reservations = await Reservation.find({ 
      userId: req.user!.id 
    }).sort({ date: 1, startTime: 1 });

    res.json({ reservations });
  } catch (error) {
    console.error('Get user reservations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllReservations: RequestHandler = async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
    
    const reservations = await Reservation.find()
      .populate('userId', 'firstName lastName email organization')
      .sort({ date: 1, startTime: 1 });

    res.json({ reservations });
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateReservationStatus: RequestHandler = async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
    
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be confirmed, cancelled, or completed' 
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'firstName lastName email organization');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({
      message: 'Reservation status updated successfully',
      reservation
    });
  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReservationsByDate: RequestHandler = async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
    
    const { date } = req.params;
    
    const reservations = await Reservation.find({
      date: new Date(date),
      status: 'confirmed'
    })
    .populate('userId', 'firstName lastName email organization')
    .sort({ startTime: 1 });

    res.json({ reservations });
  } catch (error) {
    console.error('Get reservations by date error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
