const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// One-time setup for Admin
router.get('/setup-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ email: 'admin21@gmail.com' });
    if (adminExists) {
      return res.send('<h1>Admin already exists!</h1><p>You can login with admin21@gmail.com / admin123</p>');
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin21@gmail.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    res.send('<h1>Success!</h1><p>Admin account created. Email: admin21@gmail.com, Password: admin123</p>');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Setup initial admin (one-time or check if exists)
router.post('/setup', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) return res.status(400).json({ message: 'Admin already exists' });

    const admin = new User({
      email: 'admin21@gmail.com',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    res.status(201).json({ message: 'Admin created successfully. Login with admin@crm.com / adminpassword' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
