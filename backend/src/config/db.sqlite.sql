-- =============================================
-- LAUNDRY WEBSITE DATABASE SCHEMA (SQLite)
-- =============================================

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SERVICES TABLE (Katalog Layanan)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('kg', 'pcs')),
    price DECIMAL(10, 2) NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
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
);

-- =============================================
-- ORDER ITEMS TABLE (Detail Pesanan)
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SETTINGS TABLE (Pengaturan Admin)
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample services
INSERT INTO services (name, description, unit, price) VALUES
    ('Cuci Komplit', 'Cuci + Setrika + Lipat', 'kg', 8000),
    ('Cuci Kering', 'Cuci + Kering saja', 'kg', 5000),
    ('Setrika Saja', 'Setrika dan lipat rapi', 'kg', 5000),
    ('Dry Clean', 'Dry cleaning profesional', 'pcs', 25000),
    ('Cuci Bedcover', 'Cuci bedcover/selimut besar', 'pcs', 35000),
    ('Cuci Sepatu', 'Cuci sepatu sneakers', 'pcs', 30000),
    ('Express 6 Jam', 'Cuci komplit express 6 jam', 'kg', 15000);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
    ('delivery_fee', '15000', 'Tarif flat antar-jemput laundry');

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, phone) VALUES
    ('Admin', 'admin@laundry.com', '$2a$10$7ww8FzRGzj4k6cHcdzLjqez1PNlQGBTirg5wuqw/JFe54AnULY10u', 'admin', '081234567890');
