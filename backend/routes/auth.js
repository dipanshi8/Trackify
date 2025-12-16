const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const router = express.Router();

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 */
router.post('/register', async (req, res) => {
  // Set timeout to prevent hanging requests
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('Registration request timeout');
      res.status(500).json({ message: 'Request timeout. Please try again.' });
    }
  }, 30000);

  try {
    // Check if request body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
      clearTimeout(timeout);
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ message: 'Invalid request format' });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
      clearTimeout(timeout);
      return res.status(503).json({ message: 'Database unavailable. Please try again.' });
    }

    // Extract fields from request body - handle both direct access and nested
    const username = req.body.username || req.body.user?.username;
    const email = req.body.email || req.body.user?.email;
    const password = req.body.password;

    // Validate input - handle various input types and convert to string if needed
    const usernameStr = username != null ? String(username).trim() : '';
    const emailStr = email != null ? String(email).trim() : '';
    const passwordStr = password != null ? String(password) : '';

    if (!usernameStr) {
      clearTimeout(timeout);
      return res.status(400).json({ message: 'Username is required' });
    }

    if (!emailStr) {
      clearTimeout(timeout);
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!passwordStr) {
      clearTimeout(timeout);
      return res.status(400).json({ message: 'Password is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      clearTimeout(timeout);
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (passwordStr.length < 6) {
      clearTimeout(timeout);
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Normalize inputs
    const normalizedEmail = emailStr.toLowerCase();
    const normalizedUsername = usernameStr;

    // Check if user already exists - with timeout protection
    let exists;
    try {
      exists = await Promise.race([
        User.findOne({ 
          $or: [
            { email: normalizedEmail }, 
            { username: normalizedUsername }
          ] 
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 10000))
      ]);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      clearTimeout(timeout);
      return res.status(500).json({ message: 'Database query failed. Please try again.' });
    }

    if (exists) {
      clearTimeout(timeout);
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    // Hash password with error handling
    let passwordHash;
    try {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(passwordStr, salt);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      clearTimeout(timeout);
      return res.status(500).json({ message: 'Password encryption failed. Please try again.' });
    }

    // Create user
    const user = new User({ 
      username: normalizedUsername, 
      email: normalizedEmail, 
      passwordHash 
    });

    // Save user with error handling
    let savedUser;
    try {
      savedUser = await user.save();
    } catch (saveError) {
      console.error('User save error:', saveError);
      
      // Handle duplicate key error (race condition)
      if (saveError.code === 11000) {
        const field = Object.keys(saveError.keyPattern || {})[0] || 'field';
        clearTimeout(timeout);
        return res.status(409).json({ 
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
        });
      }

      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        const messages = Object.values(saveError.errors || {}).map(e => e.message);
        clearTimeout(timeout);
        return res.status(400).json({ message: messages.join(', ') || 'Validation failed' });
      }

      clearTimeout(timeout);
      return res.status(500).json({ message: 'Failed to create account. Please try again.' });
    }

    // Generate token using JWT utility (validates JWT_SECRET automatically)
    let token;
    try {
      token = signToken({ id: savedUser._id.toString() }, '7d');
    } catch (tokenError) {
      console.error('Token generation error:', tokenError.message);
      clearTimeout(timeout);
      
      // Handle JWT_SECRET errors specifically
      if (tokenError.code === 'JWT_SECRET_MISSING' || tokenError.code === 'JWT_SECRET_INVALID') {
        return res.status(500).json({ message: 'Server configuration error. Please contact support.' });
      }
      
      return res.status(500).json({ message: 'Token generation failed. Please try again.' });
    }

    // Clear timeout and send success response
    clearTimeout(timeout);
    
    // Return response matching frontend expectations exactly
    return res.status(201).json({ 
      token, 
      user: { 
        id: savedUser._id.toString(), 
        username: savedUser.username, 
        email: savedUser.email 
      } 
    });

  } catch (err) {
    clearTimeout(timeout);
    console.error('Registration error:', err);
    console.error('Error stack:', err.stack);

    // Ensure response is always sent
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: 'Registration failed. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
      });
    }
  }
});

/**
 * POST /api/auth/login
 * Body: { emailOrUsername, password }
 */
router.post('/login', async (req, res) => {
  // Set timeout to prevent hanging requests
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error('Login request timeout');
      res.status(500).json({ message: 'Request timeout. Please try again.' });
    }
  }, 30000);

  try {
    // Check if request body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
      clearTimeout(timeout);
      console.error('Invalid request body:', req.body);
      return res.status(400).json({ message: 'Invalid request format' });
    }

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
      clearTimeout(timeout);
      return res.status(503).json({ message: 'Database unavailable. Please try again.' });
    }

    // Extract fields - handle various field name variations
    const emailOrUsername = req.body.emailOrUsername || req.body.email || req.body.username;
    const password = req.body.password;

    // Validate and normalize input - handle various input types
    const emailOrUsernameStr = emailOrUsername != null ? String(emailOrUsername).trim() : '';
    const passwordStr = password != null ? String(password) : '';

    if (!emailOrUsernameStr) {
      clearTimeout(timeout);
      return res.status(400).json({ message: 'Email/username is required' });
    }

    if (!passwordStr) {
      clearTimeout(timeout);
      return res.status(400).json({ message: 'Password is required' });
    }

    // Determine if input is email or username
    const normalizedInput = emailOrUsernameStr;
    const isEmail = normalizedInput.includes('@');

    // Find user by email or username - with timeout protection
    let user;
    try {
      const query = isEmail 
        ? { email: normalizedInput.toLowerCase() }
        : { username: normalizedInput };

      user = await Promise.race([
        User.findOne(query),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 10000))
      ]);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      clearTimeout(timeout);
      return res.status(500).json({ message: 'Database query failed. Please try again.' });
    }

    if (!user) {
      clearTimeout(timeout);
      // Use same message for both cases to prevent user enumeration
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password with error handling
    let isMatch;
    try {
      isMatch = await bcrypt.compare(passwordStr, user.passwordHash);
    } catch (compareError) {
      console.error('Password comparison error:', compareError);
      clearTimeout(timeout);
      return res.status(500).json({ message: 'Authentication failed. Please try again.' });
    }

    if (!isMatch) {
      clearTimeout(timeout);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token using JWT utility (validates JWT_SECRET automatically)
    let token;
    try {
      token = signToken({ id: user._id.toString() }, '7d');
    } catch (tokenError) {
      console.error('Token generation error:', tokenError.message);
      clearTimeout(timeout);
      
      // Handle JWT_SECRET errors specifically
      if (tokenError.code === 'JWT_SECRET_MISSING' || tokenError.code === 'JWT_SECRET_INVALID') {
        return res.status(500).json({ message: 'Server configuration error. Please contact support.' });
      }
      
      return res.status(500).json({ message: 'Token generation failed. Please try again.' });
    }

    // Clear timeout and send success response
    clearTimeout(timeout);
    
    // Return response matching frontend expectations exactly
    return res.status(200).json({ 
      token, 
      user: { 
        id: user._id.toString(), 
        username: user.username, 
        email: user.email 
      } 
    });

  } catch (err) {
    clearTimeout(timeout);
    console.error('Login error:', err);
    console.error('Error stack:', err.stack);

    // Ensure response is always sent
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: 'Login failed. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
      });
    }
  }
});

module.exports = router;
