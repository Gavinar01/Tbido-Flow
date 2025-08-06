import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { signup, signin, adminSignin } from "./routes/auth";
import {
  createReservation,
  getUserReservations,
  getAllReservations,
  updateReservationStatus,
  getReservationsByDate
} from "./routes/reservations";
// import { getVenueAvailability, getVenueSchedule } from "./routes/venues";
import { authenticateUser, requireAdmin } from "./lib/auth";
import { connectToDatabase } from "./lib/database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Initialize database connection
  connectToDatabase().catch(console.error);

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Test venue endpoint (no auth for debugging)
  app.get("/api/venues/test", (req, res) => {
    res.json({ message: "Venue API is working", timestamp: new Date().toISOString() });
  });

  // Venue availability endpoint with real reservation checking
  app.get("/api/venues/availability", authenticateUser, async (req, res) => {
    try {
      await connectToDatabase();

      const AVAILABLE_VENUES = [
        'Conference Room A',
        'Conference Room B',
        'Main Auditorium',
        'Meeting Room 1',
        'Meeting Room 2',
        'Board Room',
        'Training Room',
        'Event Hall'
      ];

      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();

      console.log('Venue availability request for date:', targetDate.toDateString());
      console.log('Query date parameter:', date);
      console.log('Target date ISO:', targetDate.toISOString());
      console.log('Today ISO:', new Date().toISOString());

      // Import models dynamically to avoid compilation issues
      const models = await import('./models/Reservation');
      const Reservation = models.Reservation;

      const reservations = await Reservation.find({
        date: {
          $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
          $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
        },
        status: 'confirmed'
      }).sort({ startTime: 1 });

      console.log(`✅ Found ${reservations.length} reservations for ${targetDate.toDateString()}`);

      // Calculate availability for each venue
      const venues = AVAILABLE_VENUES.map(venue => {
        const venueReservations = reservations.filter(r => r.venue === venue);

        if (venueReservations.length === 0) {
          return {
            venue,
            status: 'available',
            nextAvailable: null,
            currentReservation: null,
            reservations: []
          };
        }

        // Check if venue is currently occupied (simplified logic)
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // For simplicity, if it's the same day and has reservations, show when next available
        const nextReservation = venueReservations[0];
        const isCurrentlyOccupied = venueReservations.some(r => {
          return currentTime >= r.startTime && currentTime <= r.endTime;
        });

        return {
          venue,
          status: isCurrentlyOccupied ? 'occupied' : 'available',
          nextAvailable: isCurrentlyOccupied ?
            venueReservations.find(r => currentTime >= r.startTime && currentTime <= r.endTime)?.endTime :
            nextReservation.startTime,
          currentReservation: isCurrentlyOccupied ? {
            purpose: venueReservations.find(r => currentTime >= r.startTime && currentTime <= r.endTime)?.purpose || 'Meeting',
            organizer: venueReservations.find(r => currentTime >= r.startTime && currentTime <= r.endTime)?.organizerName || 'Unknown',
            endTime: venueReservations.find(r => currentTime >= r.startTime && currentTime <= r.endTime)?.endTime || ''
          } : null,
          reservations: venueReservations.map(r => ({
            startTime: r.startTime,
            endTime: r.endTime,
            purpose: r.purpose,
            organizer: r.organizerName
          }))
        };
      });

      const availableCount = venues.filter(v => v.status === 'available').length;

      res.json({
        date: targetDate.toISOString().split('T')[0],
        venues,
        totalVenues: AVAILABLE_VENUES.length,
        availableVenues: availableCount
      });
    } catch (error) {
      console.error('Venue availability error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Authentication routes
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/signin", signin);
  app.post("/api/auth/admin/signin", adminSignin);

  // Protected user routes
  app.post("/api/reservations", authenticateUser, createReservation);
  app.get("/api/reservations/my", authenticateUser, getUserReservations);
  app.get("/api/reservations/date/:date", authenticateUser, getReservationsByDate);

  // Venue availability routes (temporarily disabled for debugging)
  // app.get("/api/venues/availability", authenticateUser, getVenueAvailability);
  // app.get("/api/venues/:venue/schedule", authenticateUser, getVenueSchedule);

  // Protected admin routes
  app.get("/api/admin/reservations", authenticateUser, requireAdmin, getAllReservations);
  app.put("/api/admin/reservations/:id/status", authenticateUser, requireAdmin, updateReservationStatus);

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
