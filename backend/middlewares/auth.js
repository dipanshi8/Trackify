const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token using JWT utility (validates JWT_SECRET automatically)
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtError) {
      // Handle JWT-specific errors
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // Handle JWT_SECRET configuration errors
      if (jwtError.code === 'JWT_SECRET_MISSING' || jwtError.code === 'JWT_SECRET_INVALID') {
        console.error('JWT_SECRET configuration error in auth middleware:', jwtError.message);
        return res.status(500).json({ message: 'Server configuration error. Please contact support.' });
      }
      
      throw jwtError;
    }

    // Find user
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;
