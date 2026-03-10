const db = require('../config/database');

// Create new order
const createOrder = async (req, res) => {
    // Mock pg client for simple sqlite transactions
    const client = { query: db.query, release: () => { } };

    try {
        await client.query('BEGIN');

        const { pickup_date, pickup_address, notes, items, delivery_type = 'self_service' } = req.body;
        const userId = req.user.id;

        // Get delivery fee setting
        let deliveryFeeSetting = 0;
        if (delivery_type === 'pickup_delivery') {
            const feeResult = await client.query("SELECT value FROM settings WHERE key = 'delivery_fee'");
            deliveryFeeSetting = feeResult.rows.length > 0 ? parseFloat(feeResult.rows[0].value) : 15000;
        }

        // Create order with new status
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, pickup_date, pickup_address, notes, delivery_type, delivery_fee, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
             RETURNING *`,
            [userId, pickup_date || null, pickup_address || null, notes || null, delivery_type, deliveryFeeSetting]
        );

        const order = orderResult.rows[0];
        let totalPrice = 0;

        // Insert order items and calculate total
        for (const item of items) {
            // Get service price
            const serviceResult = await client.query(
                'SELECT price FROM services WHERE id = $1 AND is_active = true',
                [item.service_id]
            );

            if (serviceResult.rows.length === 0) {
                throw new Error(`Service with ID ${item.service_id} not found`);
            }

            const unitPrice = parseFloat(serviceResult.rows[0].price);
            const subtotal = unitPrice * item.quantity;
            totalPrice += subtotal;

            await client.query(
                `INSERT INTO order_items (order_id, service_id, quantity, unit_price, subtotal) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [order.id, item.service_id, item.quantity, unitPrice, subtotal]
            );
        }

        // Update order total price including delivery fee
        totalPrice += deliveryFeeSetting;

        await client.query(
            'UPDATE orders SET total_price = $1 WHERE id = $2',
            [totalPrice, order.id]
        );

        await client.query('COMMIT');

        // Get complete order with items
        const completeOrder = await getOrderDetails(order.id);

        res.status(201).json({
            message: 'Order created successfully',
            order: completeOrder
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ error: error.message || 'Failed to create order' });
    } finally {
        client.release();
    }
};

// Get order details helper function
const getOrderDetails = async (orderId) => {
    const orderResult = await db.query(
        `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [orderId]
    );

    if (orderResult.rows.length === 0) return null;

    const itemsResult = await db.query(
        `SELECT oi.*, s.name as service_name, s.unit 
         FROM order_items oi
         JOIN services s ON oi.service_id = s.id
         WHERE oi.order_id = $1`,
        [orderId]
    );

    return {
        ...orderResult.rows[0],
        items: itemsResult.rows
    };
};

// Get all orders (Admin: all, Customer: own orders)
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
            FROM orders o
            JOIN users u ON o.user_id = u.id
        `;
        let params = [];
        let conditions = [];

        // If customer, only show their orders
        if (req.user.role !== 'admin') {
            conditions.push(`o.user_id = $${params.length + 1}`);
            params.push(req.user.id);
        }

        // Filter by status if provided
        if (status) {
            conditions.push(`o.status = $${params.length + 1}`);
            params.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Get count for pagination
        let countQuery = 'SELECT COUNT(*) FROM orders o';
        let countParams = [];

        if (req.user.role !== 'admin') {
            countQuery += ' WHERE user_id = $1';
            countParams.push(req.user.id);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            orders: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
};

// Get single order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await getOrderDetails(id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if customer is trying to access someone else's order
        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(
            `UPDATE orders 
             SET status = $1, has_unread_update = 1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            message: 'Order status updated successfully',
            order: result.rows[0]
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};

// Update payment status (Admin only)
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const result = await db.query(
            `UPDATE orders 
             SET payment_status = $1, has_unread_update = 1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [payment_status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            message: 'Payment status updated successfully',
            order: result.rows[0]
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({ error: 'Failed to update payment status' });
    }
};

// Get order statistics (Admin only)
const getOrderStats = async (req, res) => {
    try {
        // Today's stats
        const todayStats = await db.query(`
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_price), 0) as total_revenue,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
            FROM orders 
            WHERE date(created_at) = date('now')
        `);

        // Monthly stats
        const monthlyStats = await db.query(`
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_price), 0) as total_revenue
            FROM orders 
            WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
        `);

        res.json({
            today: todayStats.rows[0],
            monthly: monthlyStats.rows[0]
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({ error: 'Failed to get order statistics' });
    }
};

// Update Actual Weight (Admin Only)
const updateActualWeight = async (req, res) => {
    const client = { query: db.query, release: () => { } };
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { items } = req.body; // [{ order_item_id, actual_quantity }]

        // Fetch order to get delivery fee
        const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderRes.rows.length === 0) throw new Error('Order not found');
        const order = orderRes.rows[0];

        let totalItemsPrice = 0;

        for (const item of items) {
            // Get current internal item data
            const oiRes = await client.query('SELECT unit_price FROM order_items WHERE id = $1 AND order_id = $2', [item.order_item_id, id]);
            if (oiRes.rows.length === 0) throw new Error(`Order item ${item.order_item_id} not found`);
            const unitPrice = parseFloat(oiRes.rows[0].unit_price);
            const subtotal = unitPrice * item.actual_quantity;
            totalItemsPrice += subtotal;

            await client.query(
                'UPDATE order_items SET quantity = $1, subtotal = $2 WHERE id = $3',
                [item.actual_quantity, subtotal, item.order_item_id]
            );
        }

        const deliveryFee = order.delivery_fee ? parseFloat(order.delivery_fee) : 0;
        const newTotal = totalItemsPrice + deliveryFee;

        // Update status to menunggu konfirmasi and total price and notify user
        await client.query(
            `UPDATE orders 
             SET total_price = $1, status = 'menunggu_konfirmasi_berat', has_unread_update = 1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [newTotal, id]
        );

        await client.query('COMMIT');

        const updatedOrder = await getOrderDetails(id);
        res.json({ message: 'Berat aktual diupdate, menunggu konfirmasi user', order: updatedOrder });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update actual weight error:', error);
        res.status(500).json({ error: error.message || 'Failed to update actual weight' });
    } finally {
        client.release();
    }
};

// Confirm Weight (Customer Only)
const confirmWeight = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Ensure user owns this order and status is waiting
        const checkRes = await db.query(
            `SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status = 'menunggu_konfirmasi_berat'`,
            [id, userId]
        );

        if (checkRes.rows.length === 0) {
            return res.status(400).json({ error: 'Order not found or not waiting for confirmation' });
        }

        await db.query(
            `UPDATE orders SET status = 'washing', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id]
        );

        res.json({ message: 'Harga baru disetujui, pesanan sedang diproses' });
    } catch (error) {
        console.error('Confirm weight error:', error);
        res.status(500).json({ error: 'Failed to confirm weight' });
    }
};

// Cancel Expired Orders (Scheduled Task)
const cancelExpiredOrders = async () => {
    try {
        // Cancel orders waiting for confirmation for > 24 hours
        // SQLite uses days for julianday difference. 1 day = 24 hours.
        const result = await db.query(
            `UPDATE orders 
             SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
             WHERE status = 'menunggu_konfirmasi_berat' 
             AND (julianday('now') - julianday(updated_at)) > 1`
        );
        if (result.rowCount > 0 || (result.changes && result.changes > 0)) {
            console.log(`[Cron] Cancelled expired orders automatically.`);
        }
    } catch (error) {
        console.error('[Cron] Cancel expired orders error:', error);
    }
};

// Mark notifications as read (Customer Only)
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Ensure user owns this order
        const result = await db.query(
            `UPDATE orders SET has_unread_update = 0 WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found or no permission' });
        }

        res.json({ message: 'Marked as read successfully' });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderStats,
    updateActualWeight,
    confirmWeight,
    cancelExpiredOrders,
    markAsRead
};
