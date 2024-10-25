const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.json());

const db = mysql.createConnection({
  host: 'sql7.freemysqlhosting.net',
  user: 'sql7740631',
  password: 'P4YdmNmYyr',
  database: 'sql7740631',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.get('/', (req, res) => {
  res.send('Aplikácia beží!');
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

// Získanie aktuálnej ankety
app.get('/anketa', authenticateToken, (req, res) => {
  db.query('SELECT * FROM ankety WHERE status = "active"', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// Odoslanie odpovede na anketu
app.post('/anketa', authenticateToken, (req, res) => {
  const { odpoved } = req.body;
  const userId = req.user.id;
  const anketaId = req.body.anketaId;
  
  db.query('INSERT INTO odpovede (user_id, anketa_id, odpoved) VALUES (?, ?, ?)', [userId, anketaId, odpoved], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Response recorded');
  });
});

// Administrátor vytvára novú anketu
app.post('/admin/anketa', authenticateToken, (req, res) => {
  const { date } = req.body;
  db.query('INSERT INTO ankety (date, status) VALUES (?, "active")', [date], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Anketa created');
  });
});

// Administrátor pridáva platbu
app.post('/admin/vklad', authenticateToken, (req, res) => {
  const { userId, suma } = req.body;
  db.query('INSERT INTO platby (user_id, suma) VALUES (?, ?)', [userId, suma], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Payment recorded');
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
