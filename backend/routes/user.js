// routes/user.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust this path if necessary to connect to your DB setup
//const authMiddleware = require('../authMiddleware'); // Ensure authMiddleware is set up correctly

// Route to get user information
router.get('/', async (req, res) => {
    try {
        // Assuming the authMiddleware attaches user info to req.user
        const userId = req.user.id;  
        const [user] = await db.query('SELECT username, isAdmin FROM users WHERE id = ?', [userId]);
        
        if (user) {
            res.json(user); // Send back the user's information
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user details' });
    }
});

module.exports = router;