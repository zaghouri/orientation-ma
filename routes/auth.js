const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// Mock database - in production use real Student model
const mockUsers = {
  'student@example.com': '$2b$10$YIjlrDgJ9V5QMmR/v0ZDW.O4UrAXlb5FKlqX3Z9dJ9mK8p3K.cPmK' // hashed 'password123'
};

// POST /auth/login - Authenticate and return JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Check if user exists
    const hashedPassword = mockUsers[email];
    if (!hashedPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, hashedPassword);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { email, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { email, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      accessToken,
      refreshToken,
      expiresIn: '24h'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
});

// POST /auth/refresh - Refresh access token
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid refresh token' 
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { email: decoded.email, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      accessToken: newAccessToken,
      expiresIn: '24h'
    });
  } catch (error) {
    res.status(401).json({ 
      error: 'Token refresh failed',
      message: error.message 
    });
  }
});

module.exports = router;
