# INSTALLATION REQUIREMENTS FOR Tbido-Flow PROJECT

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas account)

## Required Installations

### 1. Node.js Dependencies
Run the following command in the project root directory:
```bash
npm install
```

This will install all dependencies listed in package.json including:

#### Backend Dependencies:
- express: Web framework for Node.js
- mongoose: MongoDB object modeling
- bcryptjs: Password hashing
- jsonwebtoken: JWT token generation/validation
- dotenv: Environment variable management
- zod: Schema validation

#### Frontend Dependencies:
- react: UI library
- react-router-dom: Routing
- @tanstack/react-query: Data fetching
- tailwindcss: CSS framework
- framer-motion: Animation library
- three & @react-three/fiber: 3D graphics

### 2. MongoDB Setup
Option A: Local MongoDB
- Install MongoDB Community Edition from: https://www.mongodb.com/try/download/community
- Start MongoDB service

Option B: MongoDB Atlas (Cloud)
- Create account at: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string

### 3. Environment Variables
Create a `.env` file in the root directory with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### 4. Development Tools (Optional but recommended)
```bash
# Install TypeScript globally (if not already installed)
npm install -g typescript

# Install tsx for running TypeScript files directly
npm install -g tsx
```

### 5. Database Setup
After installation, run:
```bash
# Create admin user
npm run setup:admin
```

### 6. Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Additional Notes
- The project uses Vite as the build tool
- Tailwind CSS is configured for styling
- The app runs on port 3000 by default
- All dependencies are managed through the main package.json file
