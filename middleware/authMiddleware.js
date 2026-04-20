const jwt = require('jsonwebtoken');

/**
 * JWT authentication middleware
 * Verifies that the request has a valid JWT token in the Authorization header
 * Attaches decoded token to req.user
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Authorization header is required' 
    });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token type (should be 'access' for API calls)
    if (decoded.type !== 'access') {
      return res.status(401).json({ 
        error: 'Invalid token type' 
      });
    }

    // Attach user data to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token has expired' 
      });
    }
    res.status(401).json({ 
      error: 'Invalid token',
      message: error.message 
    });
  }
};

module.exports = authenticateJWT;
