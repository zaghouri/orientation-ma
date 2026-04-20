const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { Student, Career, Assessment } = require('./models');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const careerRoutes = require('./routes/careers');
const authenticateJWT = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/careers', careerRoutes);

// Protected route example
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ 
    message: 'This is a protected route',
    user: req.user 
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
