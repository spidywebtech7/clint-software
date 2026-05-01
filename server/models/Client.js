const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Called', 'Pending', 'Follow-up Required'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
