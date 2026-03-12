const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// Register new user
const register = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        // Check if email already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const result = await db.query(
            `INSERT INTO users (name, email, password, phone, address, role) 
             VALUES ($1, $2, $3, $4, $5, 'customer') 
             RETURNING id, name, email, role, phone, address, created_at`,
            [name, email, hashedPassword, phone || null, address || null]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const result = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const result = await db.query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 phone = COALESCE($2, phone), 
                 address = COALESCE($3, address),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING id, name, email, role, phone, address`,
            [name, phone, address, req.user.id]
        );

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

module.exports = { register, login, getProfile, updateProfile };
