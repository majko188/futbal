const express = require('express');
const db = require('../db');
const router = express.Router();

// Get the financial status of the logged-in user
router.get('/', (req, res) => {
    db.query('SELECT * FROM finances WHERE user_id = ?', [req.user.id], (err, financeData) => {
        if (err) return res.status(500).send(err);
        res.json(financeData[0]);
    });
});

module.exports = router;