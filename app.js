const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Session setup
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

// Register user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)', [username, hashedPassword, 0], (err) => {
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
    res.send({ message: 'Login successful', isAdmin: user.isAdmin });
  });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send({ error: 'Logout error' });
    res.send({ message: 'Logged out successfully' });
  });
});

// Get poll status with responses
app.get('/poll/status', (req, res) => {
  db.query('SELECT * FROM polls WHERE status = "open" ORDER BY id DESC LIMIT 1', (err, polls) => {
    if (err) return res.status(500).send({ error: 'Error fetching poll' });
    if (polls.length === 0) return res.status(404).send({ error: 'No active poll found' });
    
    const poll = polls[0];
    db.query('SELECT username, response FROM responses JOIN users ON responses.user_id = users.id WHERE poll_id = ?', 
             [poll.id], (err, responses) => {
      if (err) return res.status(500).send({ error: 'Error fetching responses' });
      res.send({ poll, responses });
    });
  });
});

// Vote on poll
app.post('/poll/vote', (req, res) => {
  const { pollId, response } = req.body;
  const cost = response === 'Mam hraca navyse' ? 10 : 5;

  db.query('SELECT balance FROM finances WHERE user_id = ?', [req.session.userId], (err, results) => {
    if (err || results.length === 0 || results[0].balance < cost) 
      return res.status(400).send({ error: 'Insufficient funds or error fetching balance' });
    
    db.query('INSERT INTO responses (poll_id, user_id, response) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE response = ?', 
             [pollId, req.session.userId, response, response], (err) => {
      if (err) return res.status(500).send({ error: 'Error recording vote' });

      db.query('UPDATE finances SET balance = balance - ? WHERE user_id = ?', [cost, req.session.userId], (err) => {
        if (err) return res.status(500).send({ error: 'Error updating balance' });
        db.query('INSERT INTO transactions (user_id, amount, transaction_type) VALUES (?, ?, "withdrawal")', 
                 [req.session.userId, -cost], (err) => {
          if (err) return res.status(500).send({ error: 'Error recording transaction' });
          res.send({ message: 'Vote and balance updated successfully' });
        });
      });
    });
  });
});

// Create new poll (Admin only)
app.post('/admin/poll', (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send({ error: 'Access denied' });
  
  const { dateTime, note } = req.body;
  const title = `Futbal ${dateTime}`;

  db.query('INSERT INTO polls (title, date_time, note, status) VALUES (?, ?, ?, "open")', 
           [title, dateTime, note], (err) => {
    if (err) return res.status(500).send({ error: 'Error creating poll' });
    res.send({ message: 'Poll created successfully' });
  });
});

// Close current poll (Admin only)
app.post('/admin/poll/close', (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send({ error: 'Access denied' });
  
  db.query('UPDATE polls SET status = "closed" WHERE status = "open"', (err) => {
    if (err) return res.status(500).send({ error: 'Error closing poll' });
    res.send({ message: 'Poll closed successfully' });
  });
});

// View all past polls (Admin only)
app.get('/admin/polls', (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send({ error: 'Access denied' });
  
  db.query('SELECT * FROM polls WHERE status = "closed"', (err, results) => {
    if (err) return res.status(500).send({ error: 'Error fetching polls' });
    res.send(results);
  });
});

// Add deposit for user (Admin only)
app.post('/admin/deposit', (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send({ error: 'Access denied' });

  const { userId, amount } = req.body;
  db.query('UPDATE finances SET balance = balance + ? WHERE user_id = ?', [amount, userId], (err) => {
    if (err) return res.status(500).send({ error: 'Error updating balance' });

    db.query('INSERT INTO transactions (user_id, amount, transaction_type) VALUES (?, ?, "deposit")', 
             [userId, amount], (err) => {
      if (err) return res.status(500).send({ error: 'Error recording transaction' });
      res.send({ message: 'Deposit added successfully' });
    });
  });
});

// Delete user (Admin only)
app.delete('/admin/user', (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send({ error: 'Access denied' });

  const { userId } = req.body;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
    if (err) return res.status(500).send({ error: 'Error deleting user' });
    res.send({ message: 'User deleted successfully' });
  });
});

// Get user financial info and history
app.get('/user/finances', (req, res) => {
  db.query('SELECT balance FROM finances WHERE user_id = ?', [req.session.userId], (err, balance) => {
    if (err) return res.status(500).send({ error: 'Error fetching balance' });
    
    db.query('SELECT response, (SELECT title FROM polls WHERE id = responses.poll_id) AS poll_title FROM responses WHERE user_id = ?', 
             [req.session.userId], (err, participations) => {
      if (err) return res.status(500).send({ error: 'Error fetching participations' });
      res.send({ balance: balance[0], participations });
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));