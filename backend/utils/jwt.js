const jwt = require('jsonwebtoken');

/**
 * Validates that JWT_SECRET is configured and returns it
 * Throws error if JWT_SECRET is missing or invalid
 */
function getJWTSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured');
    error.code = 'JWT_SECRET_MISSING';
    throw error;
  }

  const secret = process.env.JWT_SECRET.trim();
  
  if (secret.length < 10) {
    const error = new Error('JWT_SECRET is too short (minimum 10 characters)');
    error.code = 'JWT_SECRET_INVALID';
    throw error;
  }

  return secret;
}

/**
 * Signs a JWT token with validated JWT_SECRET
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration (default: '7d')
 * @returns {string} JWT token
 */
function signToken(payload, expiresIn = '7d') {
  try {
    const secret = getJWTSecret();
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error('JWT sign error:', error.message);
    throw error;
  }
}

/**
 * Verifies a JWT token with validated JWT_SECRET
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  try {
    const secret = getJWTSecret();
    return jwt.verify(token, secret);
  } catch (error) {
    // Re-throw JWT-specific errors for proper handling
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      throw error;
    }
    console.error('JWT verify error:', error.message);
    throw error;
  }
}

module.exports = {
  getJWTSecret,
  signToken,
  verifyToken
};

