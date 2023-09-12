// routes/users.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User'); // Import the User model

// Validation middleware for user registration
const validateRegistration = [
    body('firstname').notEmpty().withMessage('First name is required'),
    body('lastname').notEmpty().withMessage('Last name is required'),
    body('phonenumber').isMobilePhone('any', { strictMode: false }).withMessage('Invalid phone number'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('fingerprintkey').optional({ nullable: true }).isLength({ min: 10 }).withMessage('Fingerprint key must be at least 10 characters long'),
];

// Validation middleware for login
const validateLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').optional({ nullable: true }),
    body('fingerprintkey').optional({ nullable: true }),
];

// Login user
router.post('/login', async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Extract credentials from request body
    const { username, password, fingerprintkey } = req.body;

    try {
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        if (!fingerprintkey) {
            return res.status(400).json({ message: 'Fingerprint key is required' });
        }

        // Find the user by username
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.password =!password) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        if (user.fingerprintkey =! fingerprintkey) {
            return res.status(400).json({ message: 'Invalid fingerprint' });
        }

        return res.json({ message: 'Login successful', user });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register a new user
router.post('/register', validateRegistration, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, phoneNumber, firstName, lastName } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    if (!phoneNumber) {
        return res.status(400).json({ message: 'phoneNumber is required' });
    }

    if (!firstName) {
        return res.status(400).json({ message: 'firstName is required' });
    }

    if (!lastName) {
        return res.status(400).json({ message: 'lastName is required' });
    }

    try {
        // Create a new User instance and save it to the database
        // const newUser = new User(req.body);
        // const user = await newUser.save();

        res.status(201).json({ message: "Registration Successful", user: "user" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update user by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Find and update the user by ID
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Find and delete the user by ID
        const deletedUser = await User.findByIdAndRemove(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete user by ID
router.delete('/:username', async (req, res) => {
    const { username } = req.params;

    try {
        // Find and delete the user by ID
        const deletedUser = await User.findOneAndRemove(username);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ... (Login route and other routes with validation)

module.exports = router;
