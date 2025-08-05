import { RequestHandler } from 'express';
import { User } from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../lib/auth';
import { connectToDatabase } from '../lib/database';

export const signup: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { firstName, lastName, email, password, organization } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        error: 'First name, last name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      organization,
      isAdmin: false
    });

    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organization: user.organization,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const signin: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    });

    res.json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organization: user.organization,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminSignin: RequestHandler = async (req, res) => {
  try {
    await connectToDatabase();
    
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find admin user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isAdmin: true 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    });

    res.json({
      message: 'Admin signed in successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organization: user.organization,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Admin signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
