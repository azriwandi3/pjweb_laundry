const { z } = require('zod');

// User registration schema
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    address: z.string().optional()
});

// User login schema
const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

// Service schema
const serviceSchema = z.object({
    name: z.string().min(2, 'Service name must be at least 2 characters'),
    description: z.string().optional(),
    unit: z.enum(['kg', 'pcs'], { message: 'Unit must be kg or pcs' }),
    price: z.number().positive('Price must be positive')
});

// Order schema
const orderSchema = z.object({
    pickup_date: z.string().nullish(),
    pickup_address: z.string().nullish(),
    notes: z.string().nullish(),
    delivery_type: z.enum(['pickup_delivery', 'self_service']).optional(),
    items: z.array(z.object({
        service_id: z.number().int().positive(),
        quantity: z.number().positive('Quantity must be positive')
    })).min(1, 'At least one item is required')
});

// Order status update schema
const orderStatusSchema = z.object({
    status: z.enum([
        'kurir_menuju_lokasi', 'barang_diterima',
        'menunggu_penimbangan', 'menunggu_konfirmasi_berat',
        'pending', 'picked_up', 'washing', 'ironing',
        'ready', 'delivering', 'completed', 'cancelled'
    ])
});

// Validation middleware factory
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }
        next(error);
    }
};

module.exports = {
    registerSchema,
    loginSchema,
    serviceSchema,
    orderSchema,
    orderStatusSchema,
    validate
};
