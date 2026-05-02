const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

// Get all clients with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Client.countDocuments();
    const pending = await Client.countDocuments({ status: 'Pending' });
    const completed = await Client.countDocuments({ status: 'Completed' });
    const meetings = await Client.countDocuments({ meetingDate: { $gte: new Date() } });

    res.json({ total, pending, completed, meetings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Create a new client
router.post('/', async (req, res) => {
  const client = new Client(req.body);
  try {
    const newClient = await client.save();
    req.io.emit('clients:changed', { action: 'create', data: newClient });
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark client as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed' },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    // Notify all clients via socket
    if (req.io) {
      req.io.emit('clients:changed');
    }
    
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a client
router.put('/:id', async (req, res) => {

  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    req.io.emit('clients:changed', { action: 'update', data: updatedClient });
    res.json(updatedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    req.io.emit('clients:changed', { action: 'delete', id: req.params.id });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export data
router.get('/export/:format', async (req, res) => {
  try {
    const clients = await Client.find({});
    const format = req.params.format;

    if (format === 'csv') {
      const fields = ['name', 'phone', 'date', 'status', 'notes'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(clients);
      res.header('Content-Type', 'text/csv');
      res.attachment('clients.csv');
      return res.send(csv);
    } 
    
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Clients');
      worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Notes', key: 'notes', width: 30 }
      ];
      clients.forEach(c => worksheet.addRow(c));
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('clients.xlsx');
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Client Call List', 14, 15);
      const tableData = clients.map(c => [
        c.name, 
        c.phone, 
        new Date(c.date).toLocaleDateString(), 
        c.status, 
        c.notes
      ]);
      doc.autoTable({
        head: [['Name', 'Phone', 'Date', 'Status', 'Notes']],
        body: tableData,
        startY: 20,
      });
      const pdfBuffer = doc.output('arraybuffer');
      res.header('Content-Type', 'application/pdf');
      res.attachment('clients.pdf');
      return res.send(Buffer.from(pdfBuffer));
    }

    res.status(400).json({ message: 'Invalid format' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
