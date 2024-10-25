const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const path = require('path'); // Import pre path
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Slúži na obsluhovanie statických súborov z priečinka "frontend"

// Route pre zobrazenie index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html')); // Uprav na správnu cestu
});

const db = require('./database'); // Import databázy

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
  
  // Skontroluj, či existuje admin používateľ
  const adminUsername = 'admin';
  const adminPassword = 'Futbal123';

  db.query('SELECT * FROM users WHERE username = ?', [adminUsername], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      // Ak admin neexistuje, vytvor ho
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      db.query('INSERT INTO users (username, password) VALUES (?, ?)', [adminUsername, hashedPassword], (err) => {
        if (err) throw err;
        console.log('Admin user created with username:', adminUsername);
      });
    }
  });
});

// Middleware na overenie tokenu
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Registrácia používateľa
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('User created');
  });
});

// Prihlásenie používateľa
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid credentials');
    
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).send('Invalid credentials');

    const token = jwt.sign({ id: user.id }, 'secret_key');
    res.json({ token });
  });
});

// Získanie počtu prihlásených užívateľov na futbal
app.get('/anketa', authenticateToken, (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM users WHERE status = "active"', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// Získanie stavu financií pre používateľa
app.get('/financie', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.query(`
    SELECT 
      (SELECT COUNT(*) FROM odpovede WHERE user_id = ? AND odpoved = 'pridem') * 5 AS debt,
      (SELECT COALESCE(SUM(suma), 0) FROM platby WHERE user_id = ?) AS payments
  `, [userId, userId], (err, results) => {
    if (err) return res.status(500).send(err);

    const { debt, payments } = results[0];
    const balance = payments - debt;
    res.json({ debt, payments, balance });
  });
});

// V ďalšej časti backendu pridaj funkcie pre adminov:
app.post('/admin/anketa', authenticateToken, (req, res) => {
  const { date } = req.body;
  db.query('INSERT INTO ankety (date, status) VALUES (?, "active")', [date], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Anketa created');
  });
});

// ... pokračovanie s ďalšími admin funkcionalitami

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// Middleware na overenie tokenu a admin prístup
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;

        // Check if the user is an admin
        db.query('SELECT * FROM users WHERE id = ?', [user.id], (err, results) => {
            if (err) return res.status(500).send(err);
            if (results.length === 0 || results[0].username !== 'admin') {
                return res.sendStatus(403); // Forbidden
            }
            next();
        });
    });
}
// Admin creates a new survey
app.post('/admin/anketa', authenticateToken, (req, res) => {
    const { date } = req.body;
    db.query('INSERT INTO ankety (date, status) VALUES (?, "active")', [date], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Survey created');
    });
});

// Admin adds payment
app.post('/admin/vklad', authenticateToken, (req, res) => {
    const { userId, suma } = req.body;
    db.query('INSERT INTO platby (user_id, suma) VALUES (?, ?)', [userId, suma], (err) => {
        if (err) return res.status(500).send(err);
        res.send('Payment recorded');
    });
});
