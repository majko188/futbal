
const express = require('express');
const router = express.Router();
const db = require('../database');

router.post('/create-poll', (req, res) => {
    // Logic for creating poll
});

router.post('/add-payment', (req, res) => {
    // Logic for adding payments
});

module.exports = router;
