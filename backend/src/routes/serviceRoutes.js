const express = require('express');
const router = express.Router();
const {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate, serviceSchema } = require('../middleware/validate');

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, validate(serviceSchema), createService);
router.put('/:id', authMiddleware, adminMiddleware, updateService);
router.delete('/:id', authMiddleware, adminMiddleware, deleteService);

module.exports = router;
