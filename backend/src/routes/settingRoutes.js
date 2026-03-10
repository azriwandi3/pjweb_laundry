const express = require('express');
const router = express.Router();
const { getSettings, updateSetting } = require('../controllers/settingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getSettings); // Public/Everyone can read settings (e.g. knowing delivery fee)
router.put('/', authMiddleware, adminMiddleware, updateSetting);

module.exports = router;
