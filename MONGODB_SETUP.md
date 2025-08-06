# MongoDB Setup for VenueBook

## Quick Setup Instructions

### 1. Create Environment File
Copy the example environment file and add your MongoDB connection string:

```bash
cp .env.example .env
```

### 2. Add Your MongoDB Connection String
Edit the `.env` file and update the `MONGODB_URI`:

**Option A: MongoDB Atlas (Cloud - Recommended)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/venuebook
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
```

**Option B: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/venuebook
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
```

### 3. Create Admin User
After setting up your MongoDB connection, create an admin user:

```bash
npm run setup:admin
```

This creates an admin user with:
- **Email**: `admin@venuebook.com`
- **Password**: `admin123`
- **⚠️ Change this password after first login!**

### 4. Start the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## MongoDB Atlas Setup (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Add your IP address to the network access list (or use 0.0.0.0/0 for development)
5. Get your connection string from the "Connect" button
6. Replace `<username>`, `<password>`, and `<cluster>` in the connection string

Example connection string:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/venuebook
```

## Local MongoDB Setup

If you prefer running MongoDB locally:

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/venuebook`

## Testing the Connection

Once everything is set up, you can test the API endpoints:

- **Health check**: `GET /api/ping`
- **User signup**: `POST /api/auth/signup`
- **User signin**: `POST /api/auth/signin`
- **Admin signin**: `POST /api/auth/admin/signin`

## Database Collections

The app will automatically create these collections:
- `users` - User accounts and admin accounts
- `reservations` - Venue reservations with time slots
- Indexes are automatically created for optimal performance

## Security Notes

- Always use a strong `JWT_SECRET` in production
- Change the default admin password immediately
- Use MongoDB Atlas for production deployments
- Enable MongoDB authentication in production
- Use environment variables for sensitive data
