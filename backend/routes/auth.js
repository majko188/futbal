const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();
const secretKey = 'yourSecretKey';

router.post('/register', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', [username, hashedPassword, isAdmin], (err) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('User registered');
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(403).send('Invalid login');
        }
        const token = jwt.sign({ id: results[0].id, isAdmin: results[0].isAdmin }, secretKey);
        res.json({ token });
    });
});

module.exports = router;