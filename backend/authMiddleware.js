const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey';

module.exports = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).send('Token required');

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
};