const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    db.query('SELECT username, is_admin, balance FROM users WHERE id = ?', [req.session.userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        res.json(results[0]);
    });
});

module.exports = router;