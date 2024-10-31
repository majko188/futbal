const express = require('express');
const db = require('../db');
const router = express.Router();

// Get the current active poll and responses
router.get('/', (req, res) => {
    db.query('SELECT * FROM polls WHERE status = "active" ORDER BY date_time DESC LIMIT 1', (err, polls) => {
        if (err) return res.status(500).send(err);
        
        if (polls.length === 0) {
            return res.status(404).json({ error: "No active poll found" });
        }

        const poll = polls[0];
        db.query('SELECT * FROM responses WHERE poll_id = ?', [poll.id], (err, responses) => {
            if (err) return res.status(500).send(err);
            res.json({ poll, responses });
        });
    });
});

// Submit a response to the current poll
router.post('/', (req, res) => {
    const { response } = req.body;
    
    // Fetch the current active poll
    db.query('SELECT * FROM polls WHERE status = "active" ORDER BY date_time DESC LIMIT 1', (err, polls) => {
        if (err) return res.status(500).send(err);
        
        if (polls.length === 0) {
            return res.status(404).json({ error: "No active poll available to respond to." });
        }

        const poll = polls[0];
        db.query(
            'INSERT INTO responses (poll_id, user_id, response) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE response = ?', 
            [poll.id, req.user.id, response, response], 
            (err) => {
                if (err) return res.status(500).send(err);
                res.status(200).send('Response submitted');
            }
        );
    });
});

module.exports = router;