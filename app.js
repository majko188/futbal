const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // Serve HTML/CSS/JS from root

// Session setup
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

// Register new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', [username, hashedPassword, false], (err) => {
    if (err) return res.status(500).send({ error: 'Error registering user' });
    res.send({ message: 'User registered successfully' });
  });
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).send({ error: 'Invalid credentials' });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send({ error: 'Invalid credentials' });
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;
    res.send({ message: 'Login successful' });
  });
});

// Get user data
app.get('/user', (req, res) => {
  if (!req.session.userId) return res.status(401).send({ error: 'Unauthorized' });
  db.query('SELECT id, username, balance FROM users WHERE id = ?', [req.session.userId], (err, results) => {
    if (err || results.length === 0) return res.status(500).send({ error: 'User not found' });
    res.send(results[0]);
  });
});

// Fetch poll data
app.get('/poll', (req, res) => {
  db.query('SELECT * FROM polls WHERE status = "active" ORDER BY id DESC LIMIT 1', (err, polls) => {
    if (err) return res.status(500).send(err);
    const poll = polls[0];
    db.query('SELECT * FROM responses WHERE poll_id = ?', [poll.id], (err, responses) => {
      if (err) return res.status(500).send(err);
      res.json({ poll, responses });
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));