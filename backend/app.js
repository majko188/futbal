const express = require('express');
const app = express();
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(bodyParser.json());
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});