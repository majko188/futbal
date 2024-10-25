
const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    db.query('SELECT username FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
});

module.exports = router;
