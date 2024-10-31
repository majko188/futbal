const express = require('express');
const db = require('../db');
const router = express.Router();

// Middleware to check if user is authenticated (assuming you have this implemented)
// If not, you can remove this part
//const authMiddleware = require('../authMiddleware');
//router.use(authMiddleware); // Apply middleware if user authentication is required

// Get the current poll and its responses
router.get('/', (req, res) => {
    db.query('SELECT * FROM polls ORDER BY id DESC LIMIT 1', (err, polls) => {
        if (err) return res.status(500).send(err);
        const poll = polls[0];
        if (!poll) return res.status(404).send('No active poll found');
        
        db.query('SELECT * FROM responses WHERE poll_id = ?', [poll.id], (err, responses) => {
            if (err) return res.status(500).send(err);
            res.json({ poll, responses });
        });
    });
});

// Submit a response to the latest poll
router.post('/', (req, res) => {
    const { response } = req.body;
    
    // First, get the latest poll
    db.query('SELECT * FROM polls ORDER BY id DESC LIMIT 1', (err, polls) => {
        if (err) return res.status(500).send(err);
        const poll = polls[0];
        if (!poll) return res.status(404).send('No active poll found');

        // Insert or update response
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