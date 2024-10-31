const express = require('express');
const db = require('../db');
const router = express.Router();

// Get the current poll and responses
router.get('/', (req, res) => {
    db.query('SELECT * FROM polls ORDER BY id DESC LIMIT 1', (err, polls) => {
        if (err) return res.status(500).send(err);
        const poll = polls[0];
        db.query('SELECT * FROM responses WHERE poll_id = ?', [poll.id], (err, responses) => {
            if (err) return res.status(500).send(err);
            res.json({ poll, responses });
        });
    });
});

// Submit a response
router.post('/', (req, res) => {
    const { odpoved } = req.body;
    db.query('INSERT INTO responses (poll_id, user_id, response) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE odpoved = ?', [poll.id, req.user.id, odpoved, odpoved], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Response submitted');
    });
});

module.exports = router;
