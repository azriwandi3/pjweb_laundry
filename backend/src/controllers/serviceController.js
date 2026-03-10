const db = require('../config/database');

// Get all services
const getAllServices = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM services WHERE is_active = true ORDER BY name'
        );
        res.json({ services: result.rows });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ error: 'Failed to get services' });
    }
};

// Get single service by ID
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT * FROM services WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json({ service: result.rows[0] });
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({ error: 'Failed to get service' });
    }
};

// Create new service (Admin only)
const createService = async (req, res) => {
    try {
        const { name, description, unit, price } = req.body;

        const result = await db.query(
            `INSERT INTO services (name, description, unit, price) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [name, description || null, unit, price]
        );

        res.status(201).json({
            message: 'Service created successfully',
            service: result.rows[0]
        });
    } catch (error) {
        console.error('Create service error:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
};

// Update service (Admin only)
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, unit, price, is_active } = req.body;

        const result = await db.query(
            `UPDATE services 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 unit = COALESCE($3, unit),
                 price = COALESCE($4, price),
                 is_active = COALESCE($5, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6
             RETURNING *`,
            [name, description, unit, price, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json({
            message: 'Service updated successfully',
            service: result.rows[0]
        });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
};

// Delete service (Admin only)
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete by setting is_active to false
        const result = await db.query(
            `UPDATE services SET is_active = false, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};
