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

  // Authentication routes
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/signin", signin);
  app.post("/api/auth/admin/signin", adminSignin);

  // Protected user routes
  app.post("/api/reservations", authenticateUser, createReservation);
  app.get("/api/reservations/my", authenticateUser, getUserReservations);
  app.get("/api/reservations/date/:date", authenticateUser, getReservationsByDate);

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
