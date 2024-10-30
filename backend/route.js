const express = require('express');
    const router = express.Router();

    router.get('/poll', (req, res) => { res.json({ msg: "Poll data" }); });

    module.exports = router;