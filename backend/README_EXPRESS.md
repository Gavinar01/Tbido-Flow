# Tbido-Flow Express.js Backend with MongoDB

This is an Express.js backend implementation with MongoDB that replicates the functionality of the original Supabase backend.

## Features

- User authentication (signup, login)
- JWT token-based authentication
- Venue management
- Reservation system
- Attendance tracking
- CORS support for frontend integration
- MongoDB database storage

## Prerequisites

- Node.js 14+
- MongoDB database (local or cloud instance)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up MongoDB database:
   - For local MongoDB: Ensure MongoDB is running on your system
   - For cloud MongoDB: Update the `MONGODB_URI` in the `.env` file

3. Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   JWT_SECRET_KEY=your-secret-key-here
   PORT=5000
   ```

For MongoDB Atlas (like the provided connection string):
   ```env
   MONGODB_URI=mongodb+srv://Agile146658:Agile146658@cybernest.9hk32he.mongodb.net/tbido_flow
   JWT_SECRET_KEY=your-secret-key-here
   PORT=5000
   ```
   PORT=5000

4. Run the application:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:5000`.

## API Endpoints

- `POST /make-server-1bbfbc2f/signup` - User registration
- `POST /make-server-1bbfbc2f/login` - User login
- `GET /make-server-1bbfbc2f/venues` - Get venues
- `POST /make-server-1bbfbc2f/reservations` - Create reservation
- `GET /make-server-1bbfbc2f/reservations` - Get reservations
- `PUT /make-server-1bbfbc2f/reservations/:id/attendance` - Update attendance
- `DELETE /make-server-1bbfbc2f/reservations/:id` - Delete reservation

## Database Schema

The application uses four main collections:

1. `users` - User accounts and authentication
2. `venues` - Venue information
3. `reservations` - Reservation details
4. `keystore` - Key-value storage for compatibility with original system

## Migration from Flask Backend

If you're migrating from the Flask backend:

1. Ensure MongoDB is installed and running
2. Update the `.env` file with your MongoDB connection string
3. Install Node.js dependencies with `npm install`
4. Run the Express.js server with `npm start`
5. The API endpoints are identical, so no frontend changes are required

## Notes

- The backend replicates the exact API endpoints used by the frontend
- JWT tokens are used for authentication, matching the Supabase pattern
- The key-value store collection maintains compatibility with the original Supabase implementation
- All existing frontend components will work without modification
