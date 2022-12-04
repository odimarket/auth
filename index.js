const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const app = express();

require('dotenv').config();
const db = require('./config/db');

// Activating session
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

// bodyParser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * All auth routes
 */
app.use('/user', require('./routes/users.route'));
app.use('/auth', require('./routes/auth.route'));
app.use('/product', require('./routes/products.route'));
app.use('/client', require('./routes/clients.route'));
app.use('/group', require('./routes/groups.route'));
app.use('/role', require('./routes/roles.route'));
app.use('/scope', require('./routes/scopes.route'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
