const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function updateSchema() {
    try {
        const db = await open({filename: './data/crm.db', driver: sqlite3.Database});
        await db.exec('PRAGMA foreign_keys=off;');
        await db.exec('BEGIN TRANSACTION;');
        await db.exec(`
            CREATE TABLE IF NOT EXISTS clients_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                phone TEXT UNIQUE,
                business_type TEXT,
                status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
                meeting_date DATETIME,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await db.exec(`
            INSERT INTO clients_new (id, name, phone, business_type, status, meeting_date, notes, created_at)
            SELECT id, name, phone, business_type, status, meeting_date, notes, created_at FROM clients;
        `);
        await db.exec('DROP TABLE clients;');
        await db.exec('ALTER TABLE clients_new RENAME TO clients;');
        await db.exec('COMMIT;');
        await db.exec('PRAGMA foreign_keys=on;');
        console.log('Schema updated successfully');
    } catch (e) {
        console.error('Error:', e);
    }
}
updateSchema();
