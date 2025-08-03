# Tbido-Flow Flask Backend

This is a Flask backend implementation with PostgreSQL that replicates the functionality of the original Supabase backend.

## Features

- User authentication (signup, login)
- JWT token-based authentication
- Venue management
- Reservation system
- Attendance tracking
- CORS support for frontend integration

## Prerequisites

- Python 3.7+
- PostgreSQL database
- Virtual environment (recommended)

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up PostgreSQL database:
   ```sql
   CREATE DATABASE tbido_flow;
   ```

4. Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost/tbido_flow
   JWT_SECRET_KEY=your-secret-key-here
   ```

5. Run the application:
   ```bash
   python app.py
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

The application uses four main tables:

1. `users` - User accounts and authentication
2. `venues` - Venue information
3. `reservations` - Reservation details
4. `kv_store_1bbfbc2f` - Key-value storage for compatibility with original system

## Notes

- The backend replicates the exact API endpoints used by the frontend
- JWT tokens are used for authentication, matching the Supabase pattern
- The key-value store table maintains compatibility with the original Supabase implementation
