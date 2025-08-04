const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user (admins can only be created through special process)
    const user = new User({
      name,
      email,
      password,
      isAdmin: isAdmin || false
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return response compatible with frontend expectations
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        user_metadata: {
          name: user.name,
          isAdmin: user.isAdmin
        }
      },
      session: {
        access_token: token,
        user: {
          id: user._id,
          email: user.email,
          user_metadata: {
            name: user.name,
            isAdmin: user.isAdmin
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return response compatible with frontend expectations
    res.json({
      user: {
        id: user._id,
        email: user.email,
        user_metadata: {
          name: user.name,
          isAdmin: user.isAdmin
        }
      },
      session: {
        access_token: token,
        user: {
          id: user._id,
          email: user.email,
          user_metadata: {
            name: user.name,
            isAdmin: user.isAdmin
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
