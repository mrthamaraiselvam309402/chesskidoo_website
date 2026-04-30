require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const coachRoutes = require('./routes/coaches');
const classRoutes = require('./routes/classes');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/classes', classRoutes);

// Serve Static Frontend
app.use(express.static(path.join(__dirname)));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChessKidoo API is running', db: pool ? 'Connected' : 'Disconnected' });
});

// Catch-all route to serve index.html for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});