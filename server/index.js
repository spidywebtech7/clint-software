require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clients', clientRoutes);
app.use('/api/auth', authRoutes);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI not found in .env');
  process.exit(1);
}
console.log('Connecting to:', MONGODB_URI.split('@')[1] ? 'MongoDB Atlas' : 'Local MongoDB');

mongoose.connect(MONGODB_URI, {
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  family: 4 
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
