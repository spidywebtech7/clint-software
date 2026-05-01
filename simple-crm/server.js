const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const JWT_SECRET = process.env.JWT_SECRET || 'crm_secret_key_2024';

const fs = require('fs');
const path = require('path');

let db;

async function initDb() {
    try {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        db = await open({
            filename: './data/crm.db',
            driver: sqlite3.Database
        });

        // Ensure tables exist on startup
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                phone TEXT UNIQUE,
                business_type TEXT,
                status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
                meeting_date DATETIME,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create default admin user if none exists
        const adminUser = await db.get("SELECT * FROM users WHERE username = 'admin'");
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            await db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', hashedPassword]);
            console.log('Default admin user created (admin/admin)');
        }

        console.log('Connected to SQLite database at ./data/crm.db');
    } catch (error) {
        console.error('Database connection or initialization failed.', error.message);
    }
}
initDb();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- API ROUTES ---

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get Dashboard Stats
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const totalClients = await db.get('SELECT COUNT(*) as count FROM clients');
        const pendingCalls = await db.get("SELECT COUNT(*) as count FROM clients WHERE status = 'pending'");
        const completedCalls = await db.get("SELECT COUNT(*) as count FROM clients WHERE status = 'completed'");
        const meetings = await db.get("SELECT COUNT(*) as count FROM clients WHERE meeting_date IS NOT NULL AND meeting_date >= datetime('now', 'localtime')");

        res.json({
            totalClients: totalClients ? totalClients.count : 0,
            pendingCalls: pendingCalls ? pendingCalls.count : 0,
            completedCalls: completedCalls ? completedCalls.count : 0,
            meetingsScheduled: meetings ? meetings.count : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get All Clients
app.get('/api/clients', authenticateToken, async (req, res) => {
    try {
        const clients = await db.all('SELECT * FROM clients ORDER BY created_at DESC');
        res.json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Add New Client
app.post('/api/clients', authenticateToken, async (req, res) => {
    const { name, email, phone, business_type, status, meeting_date, notes } = req.body;
    try {
        // Prevent duplicate by checking email or phone BEFORE inserting
        let queryParams = [];
        let duplicateCheckQuery = 'SELECT id FROM clients WHERE ';
        let conditions = [];
        if (email) { conditions.push('email = ?'); queryParams.push(email); }
        if (phone) { conditions.push('phone = ?'); queryParams.push(phone); }
        
        if (conditions.length > 0) {
            duplicateCheckQuery += conditions.join(' OR ');
            const existingClient = await db.get(duplicateCheckQuery, queryParams);
            if (existingClient) {
                return res.status(400).json({ error: 'Client already exists with this phone number or email.' });
            }
        }

        const query = 'INSERT INTO clients (name, email, phone, business_type, status, meeting_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [name, email || null, phone || null, business_type, status || 'pending', meeting_date || null, notes || ''];
        const result = await db.run(query, values);
        res.status(201).json({ id: result.lastID, message: 'Client added successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Client already exists with this phone number or email.' });
        }
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Update Client Status
app.put('/api/clients/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.run('UPDATE clients SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Edit Client
app.put('/api/clients/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, business_type, meeting_date, notes } = req.body;
    try {
        // Prevent duplicate by checking email or phone, excluding the current client
        let queryParams = [id];
        let duplicateCheckQuery = 'SELECT id FROM clients WHERE id != ? AND (';
        let conditions = [];
        if (email) { conditions.push('email = ?'); queryParams.push(email); }
        if (phone) { conditions.push('phone = ?'); queryParams.push(phone); }
        
        if (conditions.length > 0) {
            duplicateCheckQuery += conditions.join(' OR ') + ')';
            const existingClient = await db.get(duplicateCheckQuery, queryParams);
            if (existingClient) {
                return res.status(400).json({ error: 'Another client already exists with this phone number or email.' });
            }
        }

        const query = 'UPDATE clients SET name=?, email=?, phone=?, business_type=?, meeting_date=?, notes=? WHERE id=?';
        const values = [name, email || null, phone || null, business_type, meeting_date || null, notes || '', id];
        await db.run(query, values);
        res.json({ message: 'Client updated' });
    } catch (error) {
        console.error(error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Another client already exists with this phone number or email.' });
        }
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Delete Client
app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.run('DELETE FROM clients WHERE id = ?', [id]);
        res.json({ message: 'Client deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
