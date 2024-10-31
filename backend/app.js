const express = require('express');
const cors = require('cors');
const authMiddleware = require('./authMiddleware');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/poll');
const financeRoutes = require('./routes/finance');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const path = require('path');
const app = express();
const port = 3000;
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/auth', authRoutes); // Login, register routes
app.use('/poll', authMiddleware, pollRoutes); // User poll routes
app.use('/finance', authMiddleware, financeRoutes); // Finance data for users
app.use('/admin', authMiddleware, adminRoutes); // Admin routes
app.use('/user', userRoutes);   

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});