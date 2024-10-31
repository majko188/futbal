const express = require('express');
const db = require('../db');
const router = express.Router();

// Get the financial status of the user by user_id provided in the query parameter
router.get('/', (req, res) => {
    const userId = req.query.user_id;  // Retrieve user_id from query parameters

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    db.query('SELECT * FROM finances WHERE user_id = ?', [userId], (err, financeData) => {
        if (err) return res.status(500).send(err);
        res.json(financeData[0] || { message: 'No financial data found for this user' });
    });
});

module.exports = router;