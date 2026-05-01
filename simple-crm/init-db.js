const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function initDB() {
    try {
        console.log('Connecting to SQLite database...');
        
        // Ensure data directory exists
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
            console.log('Created ./data directory.');
        }

        const db = await open({
            filename: './data/crm.db',
            driver: sqlite3.Database
        });

        console.log('Creating users table...');
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Creating clients table...');
        await db.exec(`
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                business_type TEXT,
                status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
                meeting_date DATETIME,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Checking for admin user...');
        const adminUser = await db.get("SELECT * FROM users WHERE username = 'admin'");
        if (!adminUser) {
            console.log('Creating default admin user...');
            const hashedPassword = await bcrypt.hash('admin', 10);
            await db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', hashedPassword]);
            console.log('Admin user created (admin / admin).');
        } else {
            console.log('Admin user already exists.');
        }

        console.log('Database initialization complete!');
        await db.close();
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDB();
