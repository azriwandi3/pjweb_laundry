const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderStats,
    updateActualWeight,
    confirmWeight,
    rejectWeight,
    markAsRead
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate, orderSchema, orderStatusSchema } = require('../middleware/validate');

// All routes require authentication
router.use(authMiddleware);

// Customer & Admin routes
router.post('/', validate(orderSchema), createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);

// Customer only routes
router.post('/:id/confirm-weight', confirmWeight);
router.post('/:id/reject-weight', rejectWeight);
router.put('/:id/mark-read', markAsRead);

// Admin only routes
router.patch('/:id/status', adminMiddleware, validate(orderStatusSchema), updateOrderStatus);
router.patch('/:id/payment', adminMiddleware, updatePaymentStatus);
router.post('/:id/actual-weight', adminMiddleware, updateActualWeight);
router.get('/stats/overview', adminMiddleware, getOrderStats);

module.exports = router;
