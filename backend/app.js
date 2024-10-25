
            const express = require('express');
            const bcrypt = require('bcryptjs');
            const jwt = require('jsonwebtoken');
            const mysql = require('mysql2');
            const app = express();
            const cors = require('cors');  // For enabling CORS for frontend-backend communication
            const port = 3000;

            app.use(express.json());
            app.use(cors());
            app.use(express.static('frontend')); 

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

            const authenticateToken = (req, res, next) => {
              const token = req.headers['authorization'];
              if (!token) return res.sendStatus(401);
              
              jwt.verify(token.split(" ")[1], 'secret_key', (err, user) => {
                if (err) return res.sendStatus(403);
                req.user = user;
                next();
              });
            };

            app.get('/user', authenticateToken, (req, res) => {
              db.query('SELECT username FROM users WHERE id = ?', [req.user.id], (err, results) => {
                if (err) return res.status(500).send(err);
                res.json(results[0]);
              });
            });

            app.listen(port, () => {
              console.log(`Server running on port ${port}`);
            });
        