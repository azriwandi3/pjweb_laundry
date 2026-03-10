const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Create SQLite database connection
let dbPromise = open({
    filename: path.join(__dirname, '../../laundry_db.sqlite'),
    driver: sqlite3.Database
});

const initDb = async () => {
    try {
        const db = await dbPromise;

        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');

        // Check if tables exist
        const row = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        if (!row) {
            console.log('Initializing SQLite database...');
            const schema = fs.readFileSync(path.join(__dirname, 'db.sqlite.sql'), 'utf-8');
            await db.exec(schema);
            console.log('✅ SQLite database initialized with default data');
        } else {
            console.log('✅ Connected to SQLite database');
        }
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        process.exit(-1);
    }
};

initDb();

module.exports = {
    // Custom wrapper to map PostgreSQL queries to SQLite queries
    query: async (text, params = []) => {
        const db = await dbPromise;

        // 1. Transform PostgreSQL parameters ($1, $2, etc.) to standard SQLite parameters (?)
        let sqliteText = text.replace(/\$\d+/g, '?');

        // Note: SQLite boolean true/false is 1/0, but string 'true' works mostly OR we just map booleans in JS.
        // We will just pass params as is, sqlite3 handles JS booleans by converting to 1/0.

        // 2. Determine query type
        const isSelect = /^\s*SELECT/i.test(sqliteText);
        const isReturning = /RETURNING/i.test(sqliteText);

        try {
            if (isSelect || isReturning) {
                // Return an array of rows
                const rows = await db.all(sqliteText, params);
                return { rows, rowCount: rows.length };
            } else {
                // Execute and return changes info
                const result = await db.run(sqliteText, params);
                return { rows: [], rowCount: result.changes, lastID: result.lastID };
            }
        } catch (error) {
            console.error("Database query error:", sqliteText, params, error);
            throw error;
        }
    },
    // Don't export raw pool to avoid direct pg usage in other files
    pool: null,
};
