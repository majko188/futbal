const express = require('express');
const db = require('../db');
const router = express.Router();

// Create a new poll (admin only)
router.post('/poll', (req, res) => {
    const { date, note } = req.body;
    if (!req.user.isAdmin) return res.status(403).send('Unauthorized');
    db.query('INSERT INTO polls (date, note) VALUES (?, ?)', [date, note], (err) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('Poll created');
    });
});

// View all users and their financial status
router.get('/users', (req, res) => {
    if (!req.user.isAdmin) return res.status(403).send('Unauthorized');
    db.query('SELECT username, balance FROM users', (err, users) => {
        if (err) return res.status(500).send(err);
        res.json(users);
    });
});

module.exports = router;