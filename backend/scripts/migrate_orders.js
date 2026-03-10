const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const migrate = async () => {
    try {
        const db = await open({
            filename: path.join(__dirname, '../../laundry_db.sqlite'),
            driver: sqlite3.Database
        });

        console.log('Starting migration...');

        // 1. Rename old table
        await db.exec('ALTER TABLE orders RENAME TO orders_old');
        console.log('Renamed orders to orders_old');

        // 2. Create new table without CHECK constraint and with has_unread_update
        await db.exec(`
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                total_price DECIMAL(10, 2) DEFAULT 0,
                delivery_type VARCHAR(20) DEFAULT 'self_service'
                    CHECK (delivery_type IN ('pickup_delivery', 'self_service')),
                delivery_fee DECIMAL(10, 2) DEFAULT 0,
                status VARCHAR(30) DEFAULT 'menunggu_penimbangan',
                payment_status VARCHAR(20) DEFAULT 'unpaid' 
                    CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
                pickup_date DATE,
                pickup_address TEXT,
                notes TEXT,
                has_unread_update BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created new orders table');

        // 3. Copy data from old table to new table
        await db.exec(`
            INSERT INTO orders (
                id, user_id, total_price, delivery_type, delivery_fee,
                status, payment_status, pickup_date, pickup_address, notes, created_at, updated_at
            )
            SELECT 
                id, user_id, total_price, delivery_type, delivery_fee,
                status, payment_status, pickup_date, pickup_address, notes, created_at, updated_at
            FROM orders_old
        `);
        console.log('Copied data to new orders table');

        // Restore missing indexes if necessary
        await db.exec('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
        await db.exec('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');

        // 4. Drop old table
        await db.exec('DROP TABLE orders_old');
        console.log('Dropped old orders table');

        console.log('Migration completed successfully!');
        await db.close();
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

migrate();
