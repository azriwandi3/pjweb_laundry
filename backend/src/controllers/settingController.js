const db = require('../config/database');

// Get all settings
const getSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json({ settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
};

// Update a setting
const updateSetting = async (req, res) => {
    try {
        const updates = req.body; // e.g., { delivery_fee: "15000" }
        const keys = Object.keys(updates);

        for (const key of keys) {
            const value = updates[key];
            await db.query(
                `INSERT INTO settings (key, value) VALUES ($1, $2)
                 ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
                [key, value]
            );
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

module.exports = {
    getSettings,
    updateSetting
};
