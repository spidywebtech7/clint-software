require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/Client');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/client-crm';

const sampleClients = [
  { name: 'Alice Johnson', phone: '555-0101', status: 'Called', notes: 'Interested in premium plan.' },
  { name: 'Bob Smith', phone: '555-0102', status: 'Pending', notes: 'Need to call regarding invoice.' },
  { name: 'Charlie Brown', phone: '555-0103', status: 'Follow-up Required', notes: 'Callback requested for Tuesday.' },
  { name: 'Diana Prince', phone: '555-0104', status: 'Called', notes: 'Meeting scheduled for next week.' },
  { name: 'Ethan Hunt', phone: '555-0105', status: 'Pending', notes: 'Inquiry about server setup.' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Client.deleteMany({});
    console.log('Cleared existing clients');
    
    await Client.insertMany(sampleClients);
    console.log('Sample data seeded successfully');
    
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedDB();
