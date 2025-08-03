# Tbido Flow - Figma Frontend with MongoDB and Express Backend

This project is configured to work with Figma as the frontend and MongoDB and Express for the backend.

## Backend

The backend is built with Express.js and MongoDB. It provides API endpoints for user authentication, venue management, and reservations.

### Dependencies

- express
- mongoose
- cors
- bcryptjs
- jsonwebtoken
- dotenv

### Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

   or for development:
   ```
   npm run dev
   ```

## Frontend

The frontend is integrated with Figma. The `index.html` file serves as a placeholder for the Figma frontend.

## CORS Settings

The CORS settings in `backend/server.js` allow requests from:
- http://localhost:3000
- http://localhost:5173
- https://www.figma.com

## License

MIT
