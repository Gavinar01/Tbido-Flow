# Testing the Express.js Backend with MongoDB

This guide will help you test your new Express.js backend with MongoDB to ensure everything is working.

## Prerequisites

1. Node.js installed on your system
2. MongoDB Atlas cluster accessible with the provided connection string
3. Terminal or command prompt

## Setup and Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify the .env file contains your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://Agile146658:Agile146658@cybernest.9hk32he.mongodb.net/tbido_flow
   JWT_SECRET_KEY=tbido-flow-secret-key
   PORT=5000
   ```

## Starting the Server

Start the Express.js server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

You should see output similar to:
```
Connected to MongoDB
Express server running on port 5000
```

## Testing API Endpoints

### 1. User Registration (Signup)

Test user registration with a POST request:

```bash
curl -X POST http://localhost:5000/make-server-1bbfbc2f/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "isAdmin": false
  }'
```

Expected response:
```json
{
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "user_metadata": {
      "name": "Test User",
      "isAdmin": false
    }
  },
  "access_token": "jwt_token_here"
}
```

### 2. User Login

Test user login with the registered account:

```bash
curl -X POST http://localhost:5000/make-server-1bbfbc2f/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "user_metadata": {
      "name": "Test User",
      "isAdmin": false
    }
  },
  "access_token": "jwt_token_here"
}
```

### 3. Get Venues

Test retrieving venues (no authentication required):

```bash
curl -X GET http://localhost:5000/make-server-1bbfbc2f/venues
```

Expected response:
```json
[
  {
    "id": "1",
    "name": "Conference Room A",
    "capacity": 20
  },
  {
    "id": "2",
    "name": "Conference Room B",
    "capacity": 15
  }
]
```

### 4. Create Reservation (Authenticated)

Test creating a reservation with authentication:

```bash
curl -X POST http://localhost:5000/make-server-1bbfbc2f/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "venue": "1",
    "purpose": "Team Meeting",
    "date": "2023-12-25",
    "startTime": "09:00",
    "endTime": "10:00",
    "name": "Test Reservation",
    "organization": "Test Org",
    "maxParticipants": 10
  }'
```

Expected response:
```json
{
  "reservation": {
    "id": "reservation_id",
    "userId": "user_id",
    "userEmail": "test@example.com",
    "userName": "Test User",
    "venue": "1",
    "purpose": "Team Meeting",
    "date": "2023-12-25",
    "startTime": "09:00",
    "endTime": "10:00",
    "name": "Test Reservation",
    "organization": "Test Org",
    "maxParticipants": 10,
    "status": "confirmed",
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### 5. Get Reservations (Authenticated)

Test retrieving reservations:

```bash
curl -X GET http://localhost:5000/make-server-1bbfbc2f/reservations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

Expected response:
```json
[
  {
    "id": "reservation_id",
    "userId": "user_id",
    "userEmail": "test@example.com",
    "userName": "Test User",
    "venue": "1",
    "purpose": "Team Meeting",
    "date": "2023-12-25",
    "startTime": "09:00",
    "endTime": "10:00",
    "name": "Test Reservation",
    "organization": "Test Org",
    "maxParticipants": 10,
    "status": "confirmed",
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
]
```

## Verifying MongoDB Data

You can verify that data is being stored in MongoDB by:

1. Logging into your MongoDB Atlas dashboard
2. Navigating to your cluster
3. Browsing the collections:
   - `users` collection for user accounts
   - `venues` collection for venue information
   - `reservations` collection for reservation data
   - `keystore` collection for key-value pairs

## Testing with Frontend

To test with your existing frontend:

1. Ensure your frontend is configured to point to the new backend URL (`http://localhost:5000`)
2. Start your frontend application
3. Try signing up, logging in, and creating reservations
4. Verify that all functionality works as expected

## Troubleshooting

If you encounter issues:

1. Check that MongoDB Atlas connection string is correct
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Verify that the MongoDB user has proper read/write permissions
4. Check the server console for error messages
5. Ensure the server is running on the correct port (5000)

## Common Issues and Solutions

1. **MongoDB Connection Error**: Verify your connection string and network access to MongoDB Atlas
2. **JWT Authentication Error**: Ensure you're using the correct JWT token in authenticated requests
3. **CORS Error**: The backend should already have CORS configured for localhost:3000 and localhost:5173
4. **Port Conflict**: If port 5000 is in use, change the PORT in your .env file

## Next Steps

Once testing is successful:
1. You can migrate existing data using the migration script if needed
2. Update any deployment configurations to use the new Express.js backend
3. Gradually transition your production environment to use the new backend
