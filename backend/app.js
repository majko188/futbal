const express = require('express');
const cors = require('cors');
const authMiddleware = require('./authMiddleware');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/poll');
const financeRoutes = require('./routes/finance');
const adminRoutes = require('./routes/admin');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend')); // Serve frontend files

// Routes
app.use('/auth', authRoutes);           // Login, register routes
app.use('/poll', authMiddleware, pollRoutes);    // User poll routes
app.use('/finance', authMiddleware, financeRoutes); // Finance data for users
app.use('/admin', authMiddleware, adminRoutes); // Admin routes

// Server setup
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});