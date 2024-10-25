
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('User created');
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) return res.status(401).send('Invalid credentials');
        const user = results[0];
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).send('Invalid credentials');
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
        res.json({ token });
    });
});

module.exports = router;
