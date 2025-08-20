import { RequestHandler } from 'express';
import { Reservation } from '../models/Reservation';
import { connectToDatabase } from '../lib/database';
import { AVAILABLE_VENUES } from '../../shared/api';

export const getVenueAvailability: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    
    // Get all reservations for the target date
    const reservations = await Reservation.find({
      date: {
        $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
      },
      status: 'confirmed'
    }).sort({ startTime: 1 });

    // Calculate availability for each venue
    const venueAvailability = AVAILABLE_VENUES.map(venue => {
      const venueReservations = reservations.filter(r => r.venue === venue);

      if (venueReservations.length === 0) {
        return {
          venue,
          status: 'available' as const,
          nextAvailable: null,
          currentReservation: null,
          reservations: []
        };
      }

      // Check if venue is currently occupied
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Find current reservation if any
      const currentReservation = venueReservations.find(r => {
        return currentTime >= r.startTime && currentTime <= r.endTime;
      });

      // Find next available time
      let nextAvailable = null;
      if (currentReservation) {
        nextAvailable = currentReservation.endTime;
      } else if (venueReservations.length > 0) {
        // Find next reservation after current time
        const nextReservation = venueReservations.find(r => r.startTime > currentTime);
        nextAvailable = nextReservation ? nextReservation.startTime : null;
      }

      return {
        venue,
        status: currentReservation ? 'occupied' as const : 'available' as const,
        nextAvailable,
        currentReservation: currentReservation ? {
          purpose: currentReservation.purpose,
          organizer: currentReservation.organizerName,
          endTime: currentReservation.endTime
        } : null,
        reservations: venueReservations.map(r => ({
          startTime: r.startTime,
          endTime: r.endTime,
          purpose: r.purpose,
          organizer: r.organizerName
        }))
      };
    });

    res.json({
      date: targetDate.toISOString().split('T')[0],
      venues: venueAvailability,
      totalVenues: AVAILABLE_VENUES.length,
      availableVenues: venueAvailability.filter(v => v.status === 'available').length
    });
  } catch (error) {
    console.error('Get venue availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVenueSchedule: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { venue } = req.params;
    const { date } = req.query;
    
    if (!AVAILABLE_VENUES.includes(venue as any)) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const targetDate = date ? new Date(date as string) : new Date();
    
    const reservations = await Reservation.find({
      venue,
      date: {
        $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
      },
      status: 'confirmed'
    })
    .populate('userId', 'firstName lastName organization')
    .sort({ startTime: 1 });

    res.json({
      venue,
      date: targetDate.toISOString().split('T')[0],
      reservations: reservations.map(r => ({
        id: r._id,
        startTime: r.startTime,
        endTime: r.endTime,
        purpose: r.purpose,
        organizer: r.organizerName,
        organization: r.organizerOrganization,
        participantCount: r.participantCount,
        user: r.userId
      }))
    });
  } catch (error) {
    console.error('Get venue schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
