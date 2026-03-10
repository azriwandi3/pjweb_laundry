-- =============================================
-- LAUNDRY WEBSITE DATABASE SCHEMA
-- PostgreSQL
-- =============================================

-- Enable UUID extension (optional, for better IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
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
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('kg', 'pcs')),
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_price DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'picked_up', 'washing', 'ironing', 'ready', 'delivering', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' 
        CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    pickup_date DATE,
    pickup_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ORDER ITEMS TABLE (Detail Pesanan)
-- =============================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

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

-- Insert default admin user (password: admin123)
-- Note: This is bcrypt hash for 'admin123', generate new hash in production
INSERT INTO users (name, email, password, role, phone) VALUES
    ('Admin', 'admin@laundry.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqjTb/X13qJZM7eBt/p/qQcE5KDXT6e', 'admin', '081234567890');
