const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = results[0];
        req.session.userId = user.id;
        req.session.isAdmin = user.is_admin;  // Assuming `is_admin` is a boolean column

        res.json({ message: 'Login successful', isAdmin: user.is_admin });
    });
});

module.exports = router;